import { Conversation } from "./conversation";

// ── Markdown export ───────────────────────────────────────────────────────────

export function conversationToMarkdown(conv: Conversation): string {
  const lines: string[] = [
    `# ${conv.title}`,
    `_Exported on ${new Date().toLocaleString()}_`,
    "",
  ];

  for (const msg of conv.messages) {
    if (msg.streaming) continue;
    const label = msg.role === "user" ? "## You" : "## Claude";
    lines.push(label);
    if (msg.image) lines.push("_[Image attached]_\n");
    lines.push(msg.content);
    lines.push("");
  }

  return lines.join("\n");
}

export function downloadMarkdown(conv: Conversation): void {
  const md   = conversationToMarkdown(conv);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${slugify(conv.title)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF export (browser print) ────────────────────────────────────────────────

export function printConversation(conv: Conversation): void {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escHtml(conv.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; color: #111; }
    h1 { font-size: 1.4rem; margin-bottom: 4px; }
    .meta { color: #666; font-size: 0.85rem; margin-bottom: 2rem; }
    .msg { margin-bottom: 1.5rem; }
    .label { font-weight: 700; font-size: 0.8rem; text-transform: uppercase;
             letter-spacing: 0.05em; margin-bottom: 4px; color: #555; }
    .label.user { color: #2563eb; }
    .bubble { white-space: pre-wrap; font-size: 0.95rem; line-height: 1.6; }
    pre { background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${escHtml(conv.title)}</h1>
  <p class="meta">Exported ${new Date().toLocaleString()}</p>
  ${conv.messages
    .filter((m) => !m.streaming)
    .map(
      (m) => `
  <div class="msg">
    <div class="label ${m.role}">${m.role === "user" ? "You" : "Claude"}</div>
    <div class="bubble">${escHtml(m.content)}</div>
  </div>`
    )
    .join("")}
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

// ── helpers ───────────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "conversation";
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
