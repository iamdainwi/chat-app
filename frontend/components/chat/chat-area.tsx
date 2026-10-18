"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Room, RoomUser, UserStatusEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Users,
  Menu,
  Terminal,
  Activity,
  Smile
} from "lucide-react";
import { format } from "date-fns";
import { getAvatarColor, getInitials } from "@/lib/avatar";

interface ChatAreaProps {
  room: Room | null;
  messages: Message[];
  systemNotices: UserStatusEvent[];
  typingUsers: string[];
  onlineUsers: RoomUser[];
  currentUsername: string;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onToggleMembers: () => void;
  showMembers: boolean;
  onToggleMobileSidebar: () => void;
}

const QUICK_ACTIONS = ["👋 Hello", "✅ Approved", "🚀 Shipped", "👀 Looking", "🔥 Hotfix"];

export function ChatArea({
  room,
  messages,
  systemNotices,
  typingUsers,
  onlineUsers,
  currentUsername,
  onSendMessage,
  onTyping,
  onToggleMembers,
  showMembers,
  onToggleMobileSidebar,
}: ChatAreaProps) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, systemNotices, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    onTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    onSendMessage(inputMessage);
    setInputMessage("");
    onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleQuickAction = (text: string) => {
    onSendMessage(text);
  };

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background select-none">
        <div className="size-14 rounded-lg bg-secondary text-secondary-foreground border border-border flex items-center justify-center mb-4">
          <Terminal className="size-7 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-bold mb-1">Select a Channel</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Pick a frequency from the sidebar to start transmitting in real-time.
        </p>
      </div>
    );
  }

  // Combine and sort messages and system notices by timestamp
  const displayItems: Array<
    { kind: "message"; data: Message } | { kind: "system"; data: UserStatusEvent }
  > = [
    ...messages.map((m) => ({ kind: "message" as const, data: m })),
    ...systemNotices.map((s) => ({ kind: "system" as const, data: s })),
  ];

  displayItems.sort((a, b) => {
    const timeA = new Date(a.kind === "message" ? a.data.createdAt : a.data.timestamp).getTime();
    const timeB = new Date(b.kind === "message" ? b.data.createdAt : b.data.timestamp).getTime();
    return timeA - timeB;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0">
      {/* Precision Signal Header */}
      <header className="h-14 px-4 border-b border-border flex items-center justify-between gap-3 bg-card sticky top-0 z-10 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            size="icon-xs"
            variant="outline"
            onClick={onToggleMobileSidebar}
            className="md:hidden shrink-0 border-border"
          >
            <Menu className="size-4" />
          </Button>

          <div className="size-7 rounded bg-secondary border border-border text-primary flex items-center justify-center shrink-0 font-mono text-xs font-bold">
            #
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-heading font-bold tracking-tight truncate">
                {room.name}
              </h1>
              <span className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                CHANNEL
              </span>
            </div>
            {room.description && (
              <p className="text-xs text-muted-foreground truncate hidden md:block">
                {room.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={showMembers ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleMembers}
            className="h-8 gap-1.5 text-xs font-mono border-border"
          >
            <Users className="size-3.5" />
            <span className="hidden sm:inline">MEMBERS</span>
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 font-mono bg-secondary border-border">
              {onlineUsers.length}
            </Badge>
          </Button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1 px-4 py-4">
        {displayItems.length === 0 ? (
          <div className="py-20 text-center select-none">
            <div className="size-12 rounded-md bg-secondary text-secondary-foreground border border-border mx-auto flex items-center justify-center mb-3">
              <Activity className="size-5 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-base mb-1">Channel #{room.name} Initialized</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
              No transmissions yet. Enter a message below to broadcast to this frequency.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 max-w-4xl mx-auto">
            {displayItems.map((item, idx) => {
              if (item.kind === "system") {
                const notice = item.data;
                return (
                  <div key={`notice-${idx}`} className="flex justify-center my-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary" />
                      <strong className="font-semibold">{notice.username}</strong>
                      {notice.type === "join" ? "connected" : "disconnected"}
                    </span>
                  </div>
                );
              }

              const msg = item.data;
              const isMe = msg.username === currentUsername;
              const avatarColor = getAvatarColor(msg.username);
              const initials = getInitials(msg.username);

              let formattedTime = "";
              try {
                formattedTime = format(new Date(msg.createdAt), "HH:mm");
              } catch {
                formattedTime = "";
              }

              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-3 group items-start ${
                    isMe ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar size="sm" className="mt-0.5 shrink-0 rounded-md">
                    <AvatarFallback
                      className={`${avatarColor} text-white font-mono font-bold text-xs rounded-md`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1 px-1 font-mono text-[11px]">
                      <span className="font-semibold text-foreground">
                        {isMe ? "YOU" : msg.username}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {formattedTime}
                      </span>
                    </div>

                    <div
                      className={`px-3.5 py-2.5 rounded-lg text-sm leading-relaxed border ${
                        isMe
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Typing Indicator Bar */}
      <div className="px-4 py-1 min-h-[22px] flex items-center text-xs font-mono text-muted-foreground">
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            <span className="size-1.5 bg-primary rounded-full animate-ping" />
            <span>
              <strong className="text-foreground">{typingUsers.join(", ")}</strong>{" "}
              {typingUsers.length === 1 ? "is typing..." : "are typing..."}
            </span>
          </div>
        )}
      </div>

      {/* Message Input Footer */}
      <div className="p-3 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="space-y-2 max-w-4xl mx-auto">
          {/* Quick Dispatch Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono text-muted-foreground mr-1 flex items-center gap-1">
              <Smile className="size-3" /> Quick:
            </span>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => handleQuickAction(action)}
                className="px-2 py-0.5 rounded bg-secondary/70 border border-border hover:bg-secondary text-xs font-mono transition-colors active:bg-primary active:text-primary-foreground"
              >
                {action}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={inputMessage}
                onChange={handleInputChange}
                placeholder={`Transmit to #${room.name}...`}
                className="pr-10 h-10 bg-background border-border text-sm font-sans focus-visible:ring-1 focus-visible:ring-primary rounded-md"
              />
            </div>

            <Button
              type="submit"
              size="default"
              disabled={!inputMessage.trim()}
              className="h-10 px-4 gap-1.5 font-mono text-xs font-semibold rounded-md shadow-xs"
            >
              <Send className="size-3.5" />
              <span className="hidden sm:inline">SEND</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
