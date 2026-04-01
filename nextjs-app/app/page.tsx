import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl h-[85vh]">
        <Chat title="Claude AI Assistant" placeholder="Ask me anything…" />
      </div>
    </main>
  );
}
