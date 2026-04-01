import { Conversation, Message } from "./conversation";

const CONVS_KEY   = "claude-flow:conversations";
const ACTIVE_KEY  = "claude-flow:active";
const SETTINGS_KEY = "claude-flow:settings";

// ── Conversations ─────────────────────────────────────────────────────────────

function rehydrate(conv: Conversation): Conversation {
  return {
    ...conv,
    createdAt: new Date(conv.createdAt),
    messages: conv.messages.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
      streaming: false,
    })),
  };
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVS_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Conversation[]).map(rehydrate);
  } catch { return []; }
}

export function saveConversations(convs: Conversation[]): void {
  try {
    // Don't persist incomplete streaming messages
    const clean = convs.map((c) => ({
      ...c,
      messages: c.messages.filter((m) => !m.streaming),
    }));
    localStorage.setItem(CONVS_KEY, JSON.stringify(clean));
  } catch { /* storage full */ }
}

export function loadActiveId(): string | null {
  try { return localStorage.getItem(ACTIVE_KEY); }
  catch { return null; }
}

export function saveActiveId(id: string): void {
  try { localStorage.setItem(ACTIVE_KEY, id); }
  catch { /* ignore */ }
}

export function clearAllConversations(): void {
  try {
    localStorage.removeItem(CONVS_KEY);
    localStorage.removeItem(ACTIVE_KEY);
  } catch { /* ignore */ }
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface AppSettings {
  systemPrompt: string;
  theme: "light" | "dark" | "system";
  model: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  systemPrompt: "You are a helpful assistant.",
  theme: "system",
  model: "claude-opus-4-6",
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) as AppSettings };
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(settings: AppSettings): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
  catch { /* ignore */ }
}
