/**
 * Drop-in chat UI component.
 *
 * Usage in any React/Next.js page:
 *
 *   import { Chat } from '@/components/Chat';
 *   export default function Page() {
 *     return <Chat apiUrl="/api/chat" title="My AI Bot" />;
 *   }
 *
 * Requires Tailwind CSS for styling.
 * For non-Tailwind projects, swap className strings with your own CSS.
 */

import React, { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { Message } from "../state/conversation";

export interface ChatProps {
  /** API endpoint. Defaults to /api/chat */
  apiUrl?: string;
  /** Header title */
  title?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** System prompt (passed through to useChat) */
  systemPrompt?: string;
  /** Called when a full reply arrives */
  onMessage?: (message: Message) => void;
}

export function Chat({
  apiUrl = "/api/chat",
  title = "AI Assistant",
  placeholder = "Type a message…",
  systemPrompt,
  onMessage,
}: ChatProps) {
  const { messages, input, isLoading, error, setInput, sendMessage, clear, stop } = useChat({
    apiUrl,
    systemPrompt,
    onFinish: onMessage,
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto border rounded-xl shadow-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        <button
          onClick={clear}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          title="Clear conversation"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">
            Send a message to start the conversation.
          </p>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {error && (
          <div className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
            Error: {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 bg-gray-50">
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-32"
            rows={1}
            value={input}
            placeholder={placeholder}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              onClick={stop}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium
                         hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium
                         hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              Send
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">Shift+Enter for newline · Enter to send</p>
      </div>
    </div>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap leading-relaxed
          ${isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
          }`}
      >
        {message.content}
        {message.streaming && (
          <span className="inline-block w-2 h-4 bg-current opacity-70 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}
