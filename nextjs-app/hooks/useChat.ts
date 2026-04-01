"use client";

import { useState, useCallback, useRef } from "react";
import { ImageAttachment, Message } from "@/lib/conversation";
import { useConversations } from "./useConversations";
import { loadSettings } from "@/lib/storage";

export { useConversations };

export interface UseChatOptions {
  apiUrl?: string;
}

export function useChat({ apiUrl = "/api/chat" }: UseChatOptions = {}) {
  const convs = useConversations();

  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [usage,     setUsage]     = useState<{ inputTokens: number; outputTokens: number } | null>(null);
  const [model,     setModel]     = useState(() => loadSettings().model);
  const [image,     setImage]     = useState<ImageAttachment | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content   = (text ?? input).trim();
      const hasImage  = Boolean(image);
      if ((!content && !hasImage) || isLoading) return;
      if (!convs.activeId) return;

      const settings   = loadSettings();
      const systemPrompt = settings.systemPrompt;

      setInput("");
      setError(null);
      setUsage(null);
      setIsLoading(true);

      const mgr = convs.getManager(convs.activeId);
      if (!mgr) return;

      // Add user message (with optional image)
      mgr.addUser(content, image ?? undefined);
      setImage(null);
      convs.refresh(convs.activeId);

      // Start streaming placeholder
      const streamId = mgr.beginAssistant();
      convs.refresh(convs.activeId);

      const controller = new AbortController();
      abortRef.current  = controller;

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: mgr.toApiMessages(),
            stream: true,
            model,
            systemPrompt,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
        }

        const reader  = res.body!.getReader();
        const decoder = new TextDecoder();

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break outer;
            const parsed = JSON.parse(data) as {
              chunk?: string; error?: string; done?: boolean;
              usage?: { inputTokens: number; outputTokens: number };
            };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.chunk) { mgr.appendChunk(streamId, parsed.chunk); convs.refresh(convs.activeId!); }
            if (parsed.done && parsed.usage) setUsage(parsed.usage);
          }
        }

        mgr.finalise(streamId);
        convs.refresh(convs.activeId!);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
        mgr.remove(streamId);
        convs.refresh(convs.activeId!);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [input, image, isLoading, apiUrl, model, convs]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const clearCurrent = useCallback(() => {
    if (!convs.activeId) return;
    const mgr = convs.getManager(convs.activeId);
    if (mgr) { mgr.clear(); convs.refresh(convs.activeId); }
    setError(null);
    setUsage(null);
  }, [convs]);

  // Get current messages for display
  const messages: Message[] = convs.activeConversation?.messages ?? [];

  return {
    // conversation
    conversations: convs.conversations,
    activeId:      convs.activeId,
    createNew:     convs.createNew,
    switchTo:      convs.switchTo,
    deleteConversation: convs.deleteConversation,
    // chat
    messages, input, isLoading, error, usage,
    model, image,
    setInput, setModel, setImage, sendMessage, stop,
    clearCurrent,
  };
}
