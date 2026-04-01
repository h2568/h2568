"use client";

import { useState } from "react";
import { Conversation } from "@/lib/conversation";
import { useTheme } from "@/hooks/useTheme";
import { useSession, signOut } from "next-auth/react";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNew:    () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ conversations, activeId, onNew, onSelect, onDelete }: SidebarProps) {
  const { theme, toggle } = useTheme();
  const { data: session } = useSession();
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Group by date
  const groups = groupByDate(conversations);

  return (
    <aside className="flex flex-col w-64 shrink-0 h-full bg-gray-900 dark:bg-gray-950 text-gray-100 border-r border-gray-700">

      {/* Header */}
      <div className="px-3 py-4 border-b border-gray-700">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500
                     text-white text-sm font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span> New chat
        </button>
      </div>

      {/* Conversation list */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {groups.map(({ label, items }) => (
          <div key={label}>
            <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {label}
            </p>
            {items.map((conv) => (
              <div
                key={conv.id}
                className="relative"
                onMouseEnter={() => setHoverId(conv.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <button
                  onClick={() => onSelect(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors
                    ${conv.id === activeId
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                >
                  {conv.title || "New conversation"}
                </button>

                {/* Delete button (appears on hover) */}
                {hoverId === conv.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500
                               hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

        {conversations.length === 0 && (
          <p className="px-3 py-2 text-xs text-gray-500">No conversations yet.</p>
        )}
      </nav>

      {/* Footer: theme toggle + user */}
      <div className="px-3 py-3 border-t border-gray-700 space-y-2">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400
                     hover:bg-gray-800 hover:text-white text-sm transition-colors"
        >
          {theme === "dark" ? "☀ Light mode" : "🌙 Dark mode"}
        </button>

        {session?.user && (
          <div className="flex items-center gap-2 px-3 py-2">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold">
                {(session.user.name ?? "U")[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs text-gray-400 truncate flex-1">
              {session.user.name ?? session.user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              title="Sign out"
            >
              ↩
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function groupByDate(convs: Conversation[]): { label: string; items: Conversation[] }[] {
  const now   = new Date();
  const today = startOfDay(now);
  const week  = new Date(today); week.setDate(today.getDate() - 7);

  const groups: Record<string, Conversation[]> = { Today: [], "Last 7 days": [], Older: [] };

  for (const conv of convs) {
    const d = new Date(conv.createdAt);
    if (d >= today)     groups["Today"].push(conv);
    else if (d >= week) groups["Last 7 days"].push(conv);
    else                groups["Older"].push(conv);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function startOfDay(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}
