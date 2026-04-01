"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { SettingsModal } from "./SettingsModal";
import { ImageAttachment } from "@/lib/conversation";
import { downloadMarkdown, printConversation } from "@/lib/export";

const MODELS = [
  { id: "claude-opus-4-6",           label: "Opus 4.6"   },
  { id: "claude-sonnet-4-6",         label: "Sonnet 4.6" },
  { id: "claude-haiku-4-5-20251001", label: "Haiku 4.5"  },
];

export interface ChatProps {
  apiUrl?: string;
}

export function Chat({ apiUrl }: ChatProps) {
  const {
    messages, input, isLoading, error, usage, model, image,
    activeId, conversations,
    setInput, setModel, setImage, sendMessage, stop, clearCurrent,
  } = useChat({ apiUrl });

  const [showSettings, setShowSettings] = useState(false);
  const [showExport,   setShowExport]   = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  // Image upload
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = await readAsDataUrl(file);
    const data    = preview.split(",")[1];
    const att: ImageAttachment = { data, mediaType: file.type, preview };
    setImage(att);
    e.target.value = "";
  }

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <h1 className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">
              {activeConv?.title || "Claude AI"}
            </h1>
          </div>

          {/* Model selector */}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isLoading}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1
                       bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExport((v) => !v)}
              className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
              title="Export"
            >
              ↓
            </button>
            {showExport && activeConv && (
              <div
                className="absolute right-0 top-8 z-10 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg
                           border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in"
                onMouseLeave={() => setShowExport(false)}
              >
                <button onClick={() => { downloadMarkdown(activeConv); setShowExport(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Download Markdown
                </button>
                <button onClick={() => { printConversation(activeConv); setShowExport(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Settings"
          >
            ⚙
          </button>

          {/* Clear */}
          <button
            onClick={clearCurrent}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded transition-colors"
          >
            Clear
          </button>
        </header>

        {/* ── Messages ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-2 py-16 text-center">
              <span className="text-5xl">💬</span>
              <p className="text-sm">Send a message to get started.</p>
              <p className="text-xs">Your conversations are saved locally.</p>
            </div>
          )}
          {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}

          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              ⚠ {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Usage bar ─────────────────────────────────────────────────── */}
        {usage && (
          <div className="px-5 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 flex gap-4">
            <span>↑ {usage.inputTokens.toLocaleString()} in</span>
            <span>↓ {usage.outputTokens.toLocaleString()} out</span>
          </div>
        )}

        {/* ── Image preview ──────────────────────────────────────────────── */}
        {image && (
          <div className="px-4 pt-3 flex items-center gap-2 border-t border-gray-200 dark:border-gray-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.preview} alt="attachment" className="w-14 h-14 rounded-lg object-cover border border-gray-300 dark:border-gray-600" />
            <button
              onClick={() => setImage(null)}
              className="text-xs text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        )}

        {/* ── Input ─────────────────────────────────────────────────────── */}
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-2">
            {/* Image upload button */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isLoading}
              className="shrink-0 p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm"
              title="Attach image"
            >
              🖼
            </button>

            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              placeholder="Type a message…"
              disabled={isLoading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                         text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                         px-4 py-2.5 text-sm leading-snug focus:outline-none focus:ring-2 focus:ring-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            />

            {isLoading ? (
              <button onClick={stop}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                ■ Stop
              </button>
            ) : (
              <button onClick={() => sendMessage()}
                disabled={!input.trim() && !image}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium
                           hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Send ↑
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 pl-1">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
