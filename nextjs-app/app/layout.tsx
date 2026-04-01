import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Flow – AI Chat",
  description: "AI chatbot powered by Claude",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full bg-gray-100 antialiased">{children}</body>
    </html>
  );
}
