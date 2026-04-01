import { useState, useCallback, useRef } from "react";
import { Message, ConversationManager } from "../state/conversation";

export interface UseChatOptions {
  /** URL of your chat API endpoint. Defaults to /api/chat */
  apiUrl?: string;
  /** Initial system prompt override */
  systemPrompt?: string;
  /** Called when the full assistant reply is available */
  onFinish?: (message: Message) => void;
  /** Called on any fetch/stream error */
  onError?: (error: Error) => void;
}

export interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  error: string | null;
  setInput: (value: string) => void;
  sendMessage: (text?: string) => Promise<void>;
  clear: () => void;
  stop: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { apiUrl = "/api/chat", onFinish, onError } = options;

  const [manager] = useState(() => new ConversationManager());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    setMessages([...(manager.getOrCreate().messages)]);
  }, [manager]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isLoading) return;

      setInput("");
      setError(null);
      setIsLoading(true);

      // Add user message
      manager.addUserMessage(content);
      refresh();

      // Start streaming assistant message
      const streamId = manager.beginStreamingMessage();
      refresh();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: manager.toQueryMessages(),
            stream: true,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error((err as { error: string }).error ?? res.statusText);
        }

        // Read SSE stream
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = decoder.decode(value, { stream: true }).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;

            const parsed = JSON.parse(payload) as { chunk?: string; error?: string };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.chunk) {
              manager.appendChunk(streamId, parsed.chunk);
              refresh();
            }
          }
        }

        manager.finaliseStream(streamId);
        refresh();

        const conv = manager.getOrCreate();
        const finalMsg = conv.messages.find((m) => m.id === streamId);
        if (finalMsg) onFinish?.(finalMsg);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message = (err as Error).message;
        setError(message);
        onError?.(err as Error);
        // Remove the incomplete streaming message
        const conv = manager.getOrCreate();
        conv.messages = conv.messages.filter((m) => m.id !== streamId);
        refresh();
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [input, isLoading, apiUrl, manager, onFinish, onError, refresh]
  );

  const clear = useCallback(() => {
    manager.clear();
    refresh();
  }, [manager, refresh]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, input, isLoading, error, setInput, sendMessage, clear, stop };
}
