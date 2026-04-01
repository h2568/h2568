"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Conversation, ConversationManager } from "@/lib/conversation";
import {
  loadConversations, saveConversations,
  loadActiveId, saveActiveId, clearAllConversations,
} from "@/lib/storage";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const managers = useRef(new Map<string, ConversationManager>());
  const hydrated  = useRef(false);

  // Load from localStorage on first mount
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const saved  = loadConversations();
    const active = loadActiveId();

    if (saved.length > 0) {
      saved.forEach((c) => managers.current.set(c.id, new ConversationManager(c)));
      setConversations(saved);
      setActiveIdState(active ?? saved[0].id);
    } else {
      createNew();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((convs: Conversation[]) => {
    saveConversations(convs);
  }, []);

  /** Create a brand new conversation and activate it. */
  const createNew = useCallback((): string => {
    const mgr = new ConversationManager();
    managers.current.set(mgr.id, mgr);

    setConversations((prev) => {
      const next = [mgr.conversation, ...prev];
      persist(next);
      return next;
    });
    setActiveIdState(mgr.id);
    saveActiveId(mgr.id);
    return mgr.id;
  }, [persist]);

  /** Switch to an existing conversation. */
  const switchTo = useCallback((id: string) => {
    setActiveIdState(id);
    saveActiveId(id);
  }, []);

  /** Delete a conversation. Returns the new active id. */
  const deleteConversation = useCallback((id: string): string => {
    managers.current.delete(id);

    let nextActive = "";
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persist(next);
      if (next.length === 0) {
        // Will trigger createNew below
        return next;
      }
      nextActive = next[0].id;
      return next;
    });

    if (nextActive) {
      setActiveIdState(nextActive);
      saveActiveId(nextActive);
      return nextActive;
    }

    // No conversations left → create one
    return createNew();
  }, [persist, createNew]);

  /** Get the ConversationManager for a given id. */
  const getManager = useCallback((id: string): ConversationManager | null => {
    return managers.current.get(id) ?? null;
  }, []);

  /** Notify hook that conversation content changed (triggers re-render + persist). */
  const refresh = useCallback((id: string) => {
    setConversations((prev) => {
      const mgr = managers.current.get(id);
      if (!mgr) return prev;
      const next = prev.map((c) => (c.id === id ? { ...mgr.conversation } : c));
      persist(next);
      return next;
    });
  }, [persist]);

  const clearAll = useCallback(() => {
    managers.current.clear();
    clearAllConversations();
    setConversations([]);
    createNew();
  }, [createNew]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return {
    conversations,
    activeId,
    activeConversation,
    createNew,
    switchTo,
    deleteConversation,
    getManager,
    refresh,
    clearAll,
  };
}
