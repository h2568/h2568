import { Message } from "@/lib/conversation";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-gray-100 text-gray-800 rounded-tl-sm"
          }`}
      >
        {message.content || (message.streaming ? "" : "…")}
        {message.streaming && (
          <span className="inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5 animate-blink" />
        )}
      </div>
    </div>
  );
}
