"use client";

import { useState, useRef, useEffect } from "react";
import { Message as MessageType, Room, RoomUser, UserStatusEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Users,
  Menu,
  Terminal,
  Activity,
  Smile,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { getAvatarColor, getInitials } from "@/lib/avatar";

interface ChatAreaProps {
  room: Room | null;
  messages: MessageType[];
  systemNotices: UserStatusEvent[];
  typingUsers: string[];
  onlineUsers: RoomUser[];
  currentUsername: string;
  onSendMessage: (content: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onTyping: (isTyping: boolean) => void;
  onToggleMembers: () => void;
  showMembers: boolean;
  onToggleMobileSidebar: () => void;
}

const QUICK_ACTIONS = ["👋 Hello", "✅ Approved", "🚀 Shipped", "👀 Looking", "🔥 Hotfix"];
const REACTION_EMOJIS = ["👍", "❤️", "🔥", "🚀", "😂"];

export function ChatArea({
  room,
  messages,
  systemNotices,
  typingUsers,
  onlineUsers,
  currentUsername,
  onSendMessage,
  onReactMessage,
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
        <Empty className="max-w-md border-border bg-card">
          <EmptyMedia variant="icon" className="size-12 rounded-lg bg-secondary text-primary">
            <Terminal className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle className="text-lg font-heading font-bold">Select a Frequency Channel</EmptyTitle>
            <EmptyDescription className="font-sans text-xs">
              Pick a channel from the dispatch sidebar to transmit real-time telemetry and messages.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  // Combine and sort messages and system notices by timestamp
  const displayItems: Array<
    { kind: "message"; data: MessageType } | { kind: "system"; data: UserStatusEvent }
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
          <Tooltip>
            <TooltipTrigger
              render={
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
              }
            />
            <TooltipContent side="bottom" className="font-mono text-xs">
              Toggle Online Members Panel
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Messages Scroll Area using Shadcn Message, Bubble, Marker, Avatar */}
      <ScrollArea className="flex-1 px-4 py-4">
        {displayItems.length === 0 ? (
          <div className="py-16 text-center select-none">
            <Empty className="max-w-md mx-auto border-border bg-card/60">
              <EmptyMedia variant="icon" className="size-12 rounded-lg bg-secondary text-primary">
                <Activity className="size-6" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle className="text-base font-heading font-bold">
                  Channel #{room.name} Initialized
                </EmptyTitle>
                <EmptyDescription className="font-sans text-xs">
                  No transmissions yet. Enter a message below to broadcast to this frequency.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {displayItems.map((item, idx) => {
              if (item.kind === "system") {
                const notice = item.data;
                return (
                  <Marker key={`notice-${idx}`} variant="separator" className="my-3 font-mono text-[11px]">
                    <MarkerContent className="px-2.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary" />
                      <span className="font-semibold text-foreground">{notice.username}</span>
                      <span>{notice.type === "join" ? "connected" : "disconnected"}</span>
                    </MarkerContent>
                  </Marker>
                );
              }

              const msg = item.data;
              const isMe = msg.username === currentUsername;
              const avatarColor = getAvatarColor(msg.username);
              const initials = getInitials(msg.username);
              const userAvatarUrl = msg.user?.avatar;

              let formattedTime = "";
              try {
                formattedTime = format(new Date(msg.createdAt), "HH:mm");
              } catch {
                formattedTime = "";
              }

              const reactionsMap = msg.reactions || {};
              const hasReactions = Object.keys(reactionsMap).length > 0;

              return (
                <Message
                  key={msg.id || idx}
                  align={isMe ? "end" : "start"}
                  className="group relative"
                >
                  <MessageAvatar>
                    <Avatar size="sm" className="size-8 rounded-md">
                      {userAvatarUrl ? (
                        <AvatarImage src={userAvatarUrl} alt={msg.username} />
                      ) : null}
                      <AvatarFallback
                        className={`${avatarColor} text-white font-mono font-bold text-xs rounded-md`}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </MessageAvatar>

                  <MessageContent>
                    {!isMe && (
                      <MessageHeader className="font-mono text-[11px] px-1 gap-2">
                        <span className="font-semibold text-foreground font-heading">
                          {msg.username}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {formattedTime}
                        </span>
                      </MessageHeader>
                    )}

                    <div className="relative group/bubble-container">
                      <Bubble variant={isMe ? "default" : "muted"}>
                        <BubbleContent className={isMe ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}>
                          {msg.content}
                        </BubbleContent>

                        {/* Shadcn BubbleReactions */}
                        {hasReactions && (
                          <BubbleReactions
                            align={isMe ? "end" : "start"}
                            aria-label="Message reactions"
                            className="bg-card border border-border shadow-xs"
                          >
                            {Object.entries(reactionsMap).map(([emoji, users]) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => onReactMessage(msg.id, emoji)}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors ${
                                  users.includes(currentUsername)
                                    ? "bg-primary/20 text-primary font-semibold"
                                    : "hover:bg-muted text-foreground"
                                }`}
                                title={users.join(", ")}
                              >
                                <span>{emoji}</span>
                                <span className="font-mono text-[10px]">{users.length}</span>
                              </button>
                            ))}
                          </BubbleReactions>
                        )}
                      </Bubble>

                      {/* Hover Quick Reaction Toolbar */}
                      <div className={`absolute top-0 opacity-0 group-hover/bubble-container:opacity-100 transition-opacity flex items-center gap-0.5 p-0.5 rounded-md bg-card border border-border shadow-md z-20 ${
                        isMe ? "-left-28 -translate-y-1" : "-right-28 -translate-y-1"
                      }`}>
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => onReactMessage(msg.id, emoji)}
                            className="size-6 flex items-center justify-center text-xs hover:bg-muted rounded transition-transform active:scale-90"
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <MessageFooter className="text-[10px] font-mono text-muted-foreground">
                      {isMe ? `Delivered • ${formattedTime}` : formattedTime}
                    </MessageFooter>
                  </MessageContent>
                </Message>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Typing Indicator Bar using Shadcn Marker */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1">
          <Marker role="status" className="border-0 p-0 text-xs">
            <MarkerContent className="font-mono flex items-center gap-1.5 text-muted-foreground">
              <span className="size-1.5 bg-primary rounded-full animate-ping" />
              <span className="font-semibold text-foreground">
                {typingUsers.join(", ")}
              </span>{" "}
              {typingUsers.length === 1 ? "is typing..." : "are typing..."}
            </MarkerContent>
          </Marker>
        </div>
      )}

      {/* Message Input Footer with Shadcn InputGroup & Kbd */}
      <div className="p-3 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="space-y-2 max-w-4xl mx-auto">
          {/* Quick Dispatch Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono text-muted-foreground mr-1 flex items-center gap-1">
              <Zap className="size-3 text-amber-500" /> Quick:
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

          {/* Shadcn InputGroup */}
          <InputGroup className="h-11 bg-background border-border rounded-md shadow-xs focus-within:border-primary">
            <InputGroupInput
              value={inputMessage}
              onChange={handleInputChange}
              placeholder={`Transmit to #${room.name}...`}
              className="text-sm font-sans placeholder:text-muted-foreground"
            />
            <InputGroupAddon align="inline-end" className="pr-2 gap-2">
              <Kbd className="hidden sm:inline-flex text-[10px] bg-secondary border border-border">
                ↵ Enter
              </Kbd>
              <InputGroupButton
                type="submit"
                size="icon-sm"
                variant="default"
                disabled={!inputMessage.trim()}
                className="size-8 rounded-md font-mono bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="size-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </div>
  );
}
