"use client";

import { useState } from "react";
import { Chat } from "@/components/Chat";
import { Sidebar } from "@/components/Sidebar";
import { useChat } from "@/hooks/useChat";

export default function Home() {
  const { conversations, activeId, createNew, switchTo, deleteConversation } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-30 h-full transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${sidebarOpen ? "md:block" : "md:hidden"}
      `}>
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onNew={createNew}
          onSelect={(id) => { switchTo(id); setSidebarOpen(false); }}
          onDelete={deleteConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Mobile header with sidebar toggle */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ☰
          </button>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Claude AI</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <Chat />
        </div>
      </div>
    </div>
  );
}
