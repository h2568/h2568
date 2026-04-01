"use client";

import { useEffect, useRef, KeyboardEvent } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";

export interface ChatProps {
  title?: string;
  placeholder?: string;
  apiUrl?: string;
}

export function Chat({ title = "AI Assistant", placeholder = "Type a message…", apiUrl }: ChatProps) {
  const { messages, input, isLoading, error, setInput, sendMessage, stop, clear } = useChat({ apiUrl });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <h1 className="text-white font-semibold">{title}</h1>
        </div>
        <button
          onClick={clear}
          className="text-xs text-blue-100 hover:text-white transition-colors px-2 py-1 rounded hover:bg-blue-700"
        >
          New chat
        </button>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-400 py-16">
            <div className="text-5xl">💬</div>
            <p className="text-sm">Send a message to get started.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            ⚠ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="border-t px-4 py-3 bg-gray-50">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            placeholder={placeholder}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5
                       text-sm leading-snug focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          />

          {isLoading ? (
            <button
              onClick={stop}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium
                         hover:bg-red-600 transition-colors"
            >
              ■ Stop
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium
                         hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              Send ↑
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1.5 pl-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
