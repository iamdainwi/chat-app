"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Room, RoomUser, UserStatusEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Hash,
  Send,
  Users,
  Menu,
  Smile,
  Sparkles,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { getAvatarGradient, getInitials } from "@/lib/avatar";

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

const QUICK_EMOJIS = ["👋", "👍", "❤️", "🔥", "🚀", "🎉"];

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

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, systemNotices, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Emit typing event
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

  const handleEmojiClick = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background select-none">
        <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Hash className="size-8" />
        </div>
        <h2 className="text-xl font-bold font-heading mb-1">Select a Channel</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Pick a channel from the sidebar or create a new one to start chatting in real time.
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
      {/* Header */}
      <header className="h-14 px-4 border-b border-border flex items-center justify-between gap-3 bg-card/60 backdrop-blur-md sticky top-0 z-10 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onToggleMobileSidebar}
            className="md:hidden shrink-0"
          >
            <Menu className="size-4" />
          </Button>

          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <Hash className="size-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold font-heading truncate">
                {room.name}
              </h1>
              <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 h-4">
                Channel
              </Badge>
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
            className="h-8 gap-1.5 text-xs"
          >
            <Users className="size-3.5" />
            <span className="hidden sm:inline">Members</span>
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
              {onlineUsers.length}
            </Badge>
          </Button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1 px-4 py-4">
        {displayItems.length === 0 ? (
          <div className="py-16 text-center select-none">
            <div className="size-12 rounded-xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center mb-3">
              <Sparkles className="size-6 text-primary" />
            </div>
            <h3 className="font-semibold text-base mb-1">Welcome to #{room.name}!</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              This is the beginning of the #{room.name} channel. Be the first one to say hello!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {displayItems.map((item, idx) => {
              if (item.kind === "system") {
                const notice = item.data;
                return (
                  <div key={`notice-${idx}`} className="flex justify-center my-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-muted/70 text-muted-foreground flex items-center gap-1.5">
                      <Info className="size-3" />
                      <strong className="font-medium text-foreground">{notice.username}</strong>
                      {notice.type === "join" ? "joined the channel" : "left the channel"}
                    </span>
                  </div>
                );
              }

              const msg = item.data;
              const isMe = msg.username === currentUsername;
              const gradient = getAvatarGradient(msg.username);
              const initials = getInitials(msg.username);

              let formattedTime = "";
              try {
                formattedTime = format(new Date(msg.createdAt), "h:mm a");
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
                  <Avatar size="sm" className="mt-0.5 shrink-0 shadow-sm">
                    <AvatarFallback
                      className={`bg-gradient-to-tr ${gradient} text-white font-semibold text-xs`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-semibold text-foreground">
                        {isMe ? "You" : msg.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formattedTime}
                      </span>
                    </div>

                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs break-words whitespace-pre-wrap ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-xs"
                          : "bg-card border border-border text-foreground rounded-tl-xs"
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
      <div className="px-4 py-1 min-h-[22px] flex items-center text-xs text-muted-foreground">
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in duration-200">
            <span className="inline-flex gap-1 items-center">
              <span className="size-1.5 bg-primary rounded-full animate-bounce" />
              <span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>
              <strong className="font-medium text-foreground">
                {typingUsers.join(", ")}
              </strong>{" "}
              {typingUsers.length === 1 ? "is" : "are"} typing...
            </span>
          </div>
        )}
      </div>

      {/* Message Input Footer */}
      <div className="p-3 border-t border-border bg-card/60 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-2 max-w-4xl mx-auto">
          {/* Quick Reaction Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-muted-foreground mr-1 flex items-center gap-1">
              <Smile className="size-3" /> Quick:
            </span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="px-2 py-0.5 rounded-md hover:bg-muted text-sm transition-transform active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={inputMessage}
                onChange={handleInputChange}
                placeholder={`Message #${room.name}...`}
                className="pr-10 h-10 bg-background border-input shadow-xs focus-visible:ring-1"
              />
            </div>

            <Button
              type="submit"
              size="default"
              disabled={!inputMessage.trim()}
              className="h-10 px-4 gap-1.5 shadow-sm"
            >
              <Send className="size-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
