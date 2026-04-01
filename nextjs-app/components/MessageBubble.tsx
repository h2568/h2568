"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Message } from "@/lib/conversation";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`group flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
          ${isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
      >
        {isUser ? "You" : "AI"}
      </div>

      {/* Bubble */}
      <div className={`relative max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${isUser
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-800 rounded-tl-sm prose prose-sm max-w-none"
            }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <MarkdownContent content={message.content} streaming={message.streaming} />
          )}
        </div>

        {/* Copy button — visible on hover */}
        {message.content && !message.streaming && (
          <button
            onClick={copyMessage}
            className="mt-1 text-xs text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100
                       transition-opacity px-1"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function MarkdownContent({ content, streaming }: { content: string; streaming?: boolean }) {
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? "");
            const isBlock = Boolean(match);
            return isBlock ? (
              <CodeBlock language={match![1]} code={String(children).replace(/\n$/, "")} />
            ) : (
              <code
                className="bg-gray-200 text-pink-700 rounded px-1 py-0.5 text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Open links in a new tab
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && (
        <span className="inline-block w-[2px] h-[1em] bg-gray-600 align-middle ml-0.5 animate-blink" />
      )}
    </>
  );
}

// ── Code block with copy button ───────────────────────────────────────────────

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative rounded-lg overflow-hidden my-2 text-xs">
      <div className="flex items-center justify-between bg-gray-800 px-3 py-1.5">
        <span className="text-gray-400 text-xs">{language}</span>
        <button
          onClick={copy}
          className="text-gray-400 hover:text-white transition-colors text-xs"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
