export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
  streaming?: boolean;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export class ConversationManager {
  messages: Message[] = [];

  addUser(content: string): Message {
    const msg: Message = { id: uid(), role: "user", content, createdAt: new Date() };
    this.messages.push(msg);
    return msg;
  }

  beginAssistant(): string {
    const msg: Message = {
      id: uid(),
      role: "assistant",
      content: "",
      createdAt: new Date(),
      streaming: true,
    };
    this.messages.push(msg);
    return msg.id;
  }

  appendChunk(id: string, chunk: string): void {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) msg.content += chunk;
  }

  finalise(id: string): void {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) msg.streaming = false;
  }

  remove(id: string): void {
    this.messages = this.messages.filter((m) => m.id !== id);
  }

  // Shape expected by the Anthropic SDK / our API route
  toApiMessages(): { role: Role; content: string }[] {
    return this.messages
      .filter((m) => !m.streaming && m.content.trim())
      .map(({ role, content }) => ({ role, content }));
  }

  clear(): void {
    this.messages = [];
  }
}
