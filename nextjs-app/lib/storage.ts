/**
 * Persist conversation messages to localStorage so they survive page refresh.
 */

import { Message } from "./conversation";

const KEY = "claude-flow:messages";

export function saveMessages(messages: Message[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(messages));
  } catch {
    // storage full or unavailable — silently skip
  }
}

export function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Message[];
    // Rehydrate Date objects and clear any incomplete streaming state
    return parsed.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
      streaming: false,
    }));
  } catch {
    return [];
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
