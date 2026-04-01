"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ConversationManager, Message } from "@/lib/conversation";
import { saveMessages, loadMessages, clearStorage } from "@/lib/storage";

export interface UseChatOptions {
  apiUrl?: string;
  model?: string;
  onFinish?: (message: Message) => void;
  onError?: (err: Error) => void;
}

export function useChat({
  apiUrl = "/api/chat",
  model: defaultModel = "claude-opus-4-6",
  onFinish,
  onError,
}: UseChatOptions = {}) {
  const manager = useRef(new ConversationManager());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState(defaultModel);
  const [usage, setUsage] = useState<{ inputTokens: number; outputTokens: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hydrated = useRef(false);

  // Load persisted messages on first mount
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadMessages();
    if (saved.length > 0) {
      manager.current.messages = saved;
      setMessages([...saved]);
    }
  }, []);

  const sync = useCallback(() => {
    const msgs = [...manager.current.messages];
    setMessages(msgs);
    // Only persist finalised messages
    saveMessages(msgs.filter((m) => !m.streaming));
  }, []);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isLoading) return;

      setInput("");
      setError(null);
      setUsage(null);
      setIsLoading(true);

      manager.current.addUser(content);
      sync();

      const streamId = manager.current.beginAssistant();
      sync();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ messages: manager.current.toApiMessages(), stream: true, model }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break outer;
            const parsed = JSON.parse(data) as {
              chunk?: string;
              error?: string;
              done?: boolean;
              usage?: { inputTokens: number; outputTokens: number };
            };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.chunk) {
              manager.current.appendChunk(streamId, parsed.chunk);
              sync();
            }
            if (parsed.done && parsed.usage) {
              setUsage(parsed.usage);
            }
          }
        }

        manager.current.finalise(streamId);
        sync();

        const done = manager.current.messages.find((m) => m.id === streamId);
        if (done) onFinish?.(done);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
        onError?.(err as Error);
        manager.current.remove(streamId);
        sync();
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [input, isLoading, apiUrl, model, onFinish, onError, sync]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const clear = useCallback(() => {
    manager.current.clear();
    clearStorage();
    setMessages([]);
    setError(null);
    setUsage(null);
  }, []);

  return { messages, input, isLoading, error, usage, model, setInput, setModel, sendMessage, stop, clear };
}
