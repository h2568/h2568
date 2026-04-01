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

  async function copy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`group flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
        ${isUser ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
      >
        {isUser ? "You" : "AI"}
      </div>

      {/* Bubble + copy */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>

        {/* Image attachment */}
        {message.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.image.preview}
            alt="attachment"
            className="mb-2 max-w-[240px] max-h-[240px] rounded-xl object-cover border border-gray-200 dark:border-gray-600"
          />
        )}

        {/* Text bubble */}
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? "bg-blue-600 text-white rounded-tr-sm whitespace-pre-wrap"
            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-sm prose prose-sm dark:prose-invert max-w-none"
          }`}
        >
          {isUser ? (
            message.content || <span className="opacity-50 italic">Image</span>
          ) : (
            <MarkdownContent content={message.content} streaming={message.streaming} />
          )}
        </div>

        {/* Copy button */}
        {message.content && !message.streaming && (
          <button
            onClick={copy}
            className="mt-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300
                       opacity-0 group-hover:opacity-100 transition-opacity px-1"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Markdown ──────────────────────────────────────────────────────────────────

function MarkdownContent({ content, streaming }: { content: string; streaming?: boolean }) {
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className ?? "");
            return match ? (
              <CodeBlock language={match[1]} code={String(children).replace(/\n$/, "")} />
            ) : (
              <code className="bg-gray-200 dark:bg-gray-700 text-pink-600 dark:text-pink-400 rounded px-1 py-0.5 text-xs font-mono">
                {children}
              </code>
            );
          },
          a({ href, children }) {
            return <a href={href} target="_blank" rel="noopener noreferrer" className="underline">{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && (
        <span className="inline-block w-[2px] h-[1em] bg-gray-600 dark:bg-gray-400 align-middle ml-0.5 animate-blink" />
      )}
    </>
  );
}

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
        <button onClick={copy} className="text-gray-400 hover:text-white transition-colors text-xs">
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter style={oneDark} language={language} PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.8rem" }}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
