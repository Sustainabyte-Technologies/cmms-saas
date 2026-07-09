"use client";

import { ChatWidget } from "@/components/dashboard/chat-widget";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px] border border-border rounded-2xl overflow-hidden bg-card shadow-lg">
      <ChatWidget />
    </div>
  );
}
