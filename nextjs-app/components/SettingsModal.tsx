"use client";

import { useState, useEffect } from "react";
import { loadSettings, saveSettings, AppSettings } from "@/lib/storage";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [saved, setSaved] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              System prompt
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Instructions Claude follows in every conversation.
            </p>
            <textarea
              rows={5}
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                         text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm leading-snug
                         focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="You are a helpful assistant."
            />
          </div>

          {/* Default Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Default model
            </label>
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                         text-gray-900 dark:text-gray-100 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="claude-opus-4-6">Claude Opus 4.6 — most capable</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6 — fast + smart</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 — fastest, cheapest</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Theme
            </label>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSettings({ ...settings, theme: t })}
                  className={`flex-1 py-2 rounded-xl text-sm capitalize transition-colors
                    ${settings.theme === t
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  {t === "light" ? "☀ Light" : t === "dark" ? "🌙 Dark" : "⚙ System"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium
                       hover:bg-blue-700 transition-colors"
          >
            {saved ? "✓ Saved!" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
