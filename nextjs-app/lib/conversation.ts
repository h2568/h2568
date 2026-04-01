export type Role = "user" | "assistant";

export interface ImageAttachment {
  data: string;        // base64
  mediaType: string;   // e.g. "image/jpeg"
  preview: string;     // data URL for <img> display
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  image?: ImageAttachment;
  createdAt: Date;
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function titleFrom(content: string): string {
  return content.slice(0, 48) + (content.length > 48 ? "…" : "");
}

export class ConversationManager {
  conversation: Conversation;

  constructor(conv?: Conversation) {
    this.conversation = conv ?? {
      id: uid(),
      title: "New conversation",
      createdAt: new Date(),
      messages: [],
    };
  }

  get messages() { return this.conversation.messages; }
  get id()       { return this.conversation.id; }

  addUser(content: string, image?: ImageAttachment): Message {
    const msg: Message = { id: uid(), role: "user", content, image, createdAt: new Date() };
    if (this.conversation.messages.length === 0) {
      this.conversation.title = titleFrom(content);
    }
    this.conversation.messages.push(msg);
    return msg;
  }

  beginAssistant(): string {
    const msg: Message = { id: uid(), role: "assistant", content: "", createdAt: new Date(), streaming: true };
    this.conversation.messages.push(msg);
    return msg.id;
  }

  appendChunk(id: string, chunk: string): void {
    const msg = this.conversation.messages.find((m) => m.id === id);
    if (msg) msg.content += chunk;
  }

  finalise(id: string): void {
    const msg = this.conversation.messages.find((m) => m.id === id);
    if (msg) msg.streaming = false;
  }

  remove(id: string): void {
    this.conversation.messages = this.conversation.messages.filter((m) => m.id !== id);
  }

  clear(): void {
    this.conversation.messages = [];
    this.conversation.title = "New conversation";
  }

  // Converts to Anthropic API message format (handles text + image)
  toApiMessages(): ApiMessage[] {
    return this.conversation.messages
      .filter((m) => !m.streaming && (m.content.trim() || m.image))
      .map((m) => {
        if (m.image) {
          return {
            role: m.role,
            content: [
              {
                type: "image" as const,
                source: { type: "base64" as const, media_type: m.image.mediaType, data: m.image.data },
              },
              ...(m.content.trim() ? [{ type: "text" as const, text: m.content }] : []),
            ],
          };
        }
        return { role: m.role, content: m.content };
      });
  }
}

// Type for what we send to the API route
export type ApiMessage =
  | { role: Role; content: string }
  | { role: Role; content: Array<{ type: "text"; text: string } | { type: "image"; source: { type: "base64"; media_type: string; data: string } }> };
