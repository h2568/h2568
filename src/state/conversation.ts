import { QueryMessage } from "../QueryEngine";

export interface Message extends QueryMessage {
  id: string;
  timestamp: string;
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  createdAt: string;
  messages: Message[];
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export class ConversationManager {
  private conversations = new Map<string, Conversation>();
  private activeId: string | null = null;

  // ── create / switch ────────────────────────────────────────────────────────

  new(): Conversation {
    const conv: Conversation = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      messages: [],
    };
    this.conversations.set(conv.id, conv);
    this.activeId = conv.id;
    return conv;
  }

  getOrCreate(): Conversation {
    if (this.activeId && this.conversations.has(this.activeId)) {
      return this.conversations.get(this.activeId)!;
    }
    return this.new();
  }

  get(id: string): Conversation | null {
    return this.conversations.get(id) ?? null;
  }

  listAll(): Conversation[] {
    return Array.from(this.conversations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  setActive(id: string): void {
    if (!this.conversations.has(id)) throw new Error(`Conversation not found: ${id}`);
    this.activeId = id;
  }

  delete(id: string): boolean {
    if (this.activeId === id) this.activeId = null;
    return this.conversations.delete(id);
  }

  // ── messages ───────────────────────────────────────────────────────────────

  addUserMessage(text: string, conversationId?: string): Message {
    const conv = conversationId
      ? this.conversations.get(conversationId)!
      : this.getOrCreate();

    const msg: Message = {
      id: makeId(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    conv.messages.push(msg);
    return msg;
  }

  addAssistantMessage(text: string, conversationId?: string): Message {
    const conv = conversationId
      ? this.conversations.get(conversationId)!
      : this.getOrCreate();

    const msg: Message = {
      id: makeId(),
      role: "assistant",
      content: text,
      timestamp: new Date().toISOString(),
    };
    conv.messages.push(msg);
    return msg;
  }

  // Adds a placeholder assistant message and returns its id.
  // Call appendChunk() as stream chunks arrive, then finalise().
  beginStreamingMessage(conversationId?: string): string {
    const conv = conversationId
      ? this.conversations.get(conversationId)!
      : this.getOrCreate();

    const msg: Message = {
      id: makeId(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      streaming: true,
    };
    conv.messages.push(msg);
    return msg.id;
  }

  appendChunk(messageId: string, chunk: string, conversationId?: string): void {
    const conv = conversationId
      ? this.conversations.get(conversationId)!
      : this.getOrCreate();
    const msg = conv.messages.find((m) => m.id === messageId);
    if (msg) msg.content += chunk;
  }

  finaliseStream(messageId: string, conversationId?: string): void {
    const conv = conversationId
      ? this.conversations.get(conversationId)!
      : this.getOrCreate();
    const msg = conv.messages.find((m) => m.id === messageId);
    if (msg) msg.streaming = false;
  }

  // Returns messages in the format QueryEngine expects
  toQueryMessages(conversationId?: string): QueryMessage[] {
    const conv = conversationId
      ? this.conversations.get(conversationId)
      : this.conversations.get(this.activeId ?? "");
    if (!conv) return [];
    return conv.messages
      .filter((m) => !m.streaming)
      .map(({ role, content }) => ({ role, content }));
  }

  clear(conversationId?: string): void {
    const id = conversationId ?? this.activeId;
    if (!id) return;
    const conv = this.conversations.get(id);
    if (conv) conv.messages = [];
  }
}

// Singleton for use across the app
export const conversation = new ConversationManager();
