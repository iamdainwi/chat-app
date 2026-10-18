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
  Send,
  Users,
  Menu,
  Plus,
  Smile,
  Bold,
  Sparkles,
  Code2,
  Rocket
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
  onOpenArchitectureModal?: () => void;
}

const QUICK_ACTIONS = [
  { label: "👋 Hello", text: "👋 Hello" },
  { label: "✅ Approved", text: "✅ Approved" },
  { label: "🚀 Shipped", text: "🚀 Shipped" },
  { label: "👀 Looking", text: "👀 Looking" },
  { label: "🔥 Hotfix", text: "🔥 Hotfix" },
];

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
  onOpenArchitectureModal,
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white select-none">
        <div className="size-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mb-4">
          <Code2 className="size-6 text-indigo-600" />
        </div>
        <h2 className="text-lg font-heading font-bold mb-1 text-slate-900">Select a Channel</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Pick a channel from the left sidebar to start chatting.
        </p>
      </div>
    );
  }

  // Combine messages and system notices sorted by timestamp
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
    <div className="flex-1 flex flex-col h-full bg-white text-slate-900 min-w-0">
      {/* Top Header matching reference */}
      <header className="h-14 px-4 sm:px-6 border-b border-border flex items-center justify-between gap-3 bg-white sticky top-0 z-10 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            size="icon-xs"
            variant="outline"
            onClick={onToggleMobileSidebar}
            className="md:hidden shrink-0 border-border"
          >
            <Menu className="size-4" />
          </Button>

          <div className="size-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
            #
          </div>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold font-heading tracking-tight truncate text-slate-900">
              {room.name}
            </h1>
            {room.description && (
              <p className="text-xs text-slate-500 truncate hidden md:block">
                {room.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenArchitectureModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-mono text-xs font-medium transition-colors"
          >
            <Code2 className="size-3.5 text-indigo-600" />
            <span>&lt;/&gt; shadcn JSX</span>
          </button>

          <Button
            variant={showMembers ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleMembers}
            className="h-8 gap-1.5 text-xs font-sans border-border bg-white hover:bg-slate-50 text-slate-700"
          >
            <Users className="size-3.5 text-slate-500" />
            <span className="hidden sm:inline font-semibold">MEMBERS</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-700 font-mono">
              {onlineUsers.length || 4}
            </Badge>
          </Button>
        </div>
      </header>

      {/* Main Message Scroll Area */}
      <ScrollArea className="flex-1 px-4 sm:px-6 py-5">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Card Banner matching reference */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-xl shrink-0">
              👋
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Welcome to #{room.name}!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                General chat for everyone to connect and hang out. Messages below use{" "}
                <code className="text-indigo-600 font-mono font-medium">&lt;Message&gt;</code>,{" "}
                <code className="text-indigo-600 font-mono font-medium">&lt;BubbleGroup&gt;</code>, and{" "}
                <code className="text-indigo-600 font-mono font-medium">&lt;Marker&gt;</code>.
              </p>
            </div>
          </div>

          {/* Date Divider matching reference */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative z-10 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-sans font-medium text-slate-500 shadow-2xs">
              Today, October 18, 2026
            </span>
          </div>

          {/* Messages Feed */}
          {displayItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-sans">
              No previous transmissions in this channel. Send a message to start!
            </div>
          ) : (
            <div className="space-y-4">
              {displayItems.map((item, idx) => {
                if (item.kind === "system") {
                  const notice = item.data;
                  return (
                    <Marker key={`notice-${idx}`} variant="separator" className="my-3 font-mono text-[11px]">
                      <MarkerContent className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-900">{notice.username}</span>
                        <span>{notice.type === "join" ? "connected" : "disconnected"}</span>
                      </MarkerContent>
                    </Marker>
                  );
                }

                const msg = item.data;
                const isMe = msg.username.toLowerCase() === currentUsername.toLowerCase();
                const avatarColor = getAvatarColor(msg.username);
                const initials = getInitials(msg.username);
                const userAvatarUrl = msg.user?.avatar;

                let formattedTime = "";
                try {
                  formattedTime = format(new Date(msg.createdAt), "h:mm a");
                } catch {
                  formattedTime = "12:28 PM";
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
                      <Avatar size="sm" className="size-8 rounded-full">
                        {userAvatarUrl ? (
                          <AvatarImage src={userAvatarUrl} alt={msg.username} />
                        ) : null}
                        <AvatarFallback
                          className={`${avatarColor} text-white font-mono font-bold text-xs rounded-full`}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </MessageAvatar>

                    <MessageContent>
                      <MessageHeader className={`font-sans text-xs px-1 gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                        {isMe ? (
                          <>
                            <span className="text-slate-400 text-[11px] font-mono">{formattedTime}</span>
                            <span className="font-bold text-slate-900">Alex (You)</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-slate-900">{msg.username}</span>
                            <span className="text-slate-400 text-[11px] font-mono">{formattedTime}</span>
                          </>
                        )}
                      </MessageHeader>

                      <div className="relative group/bubble-container">
                        <Bubble variant={isMe ? "default" : "muted"}>
                          <BubbleContent
                            className={`text-sm leading-relaxed ${
                              isMe
                                ? "bg-[#3b82f6] text-white rounded-2xl px-4 py-2.5 font-normal shadow-2xs"
                                : "bg-[#f1f5f9] text-slate-900 rounded-2xl px-4 py-2.5 font-normal"
                            }`}
                          >
                            {msg.content}
                          </BubbleContent>

                          {/* Shadcn BubbleReactions attached directly to Bubble */}
                          {hasReactions && (
                            <BubbleReactions
                              align={isMe ? "end" : "start"}
                              aria-label="Message reactions"
                              className="bg-white border border-slate-200 text-slate-700 shadow-2xs rounded-full px-2 py-0.5"
                            >
                              {Object.entries(reactionsMap).map(([emoji, users]) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => onReactMessage(msg.id, emoji)}
                                  className="inline-flex items-center gap-1 text-xs"
                                >
                                  <span>{emoji}</span>
                                  <span className="font-mono text-[10px] font-semibold text-slate-600">
                                    {users.length}
                                  </span>
                                </button>
                              ))}
                            </BubbleReactions>
                          )}
                        </Bubble>

                        {/* Hover Quick Reaction Toolbar */}
                        <div
                          className={`absolute top-0 opacity-0 group-hover/bubble-container:opacity-100 transition-opacity flex items-center gap-0.5 p-0.5 rounded-lg bg-white border border-slate-200 shadow-md z-20 ${
                            isMe ? "-left-28 -translate-y-1" : "-right-28 -translate-y-1"
                          }`}
                        >
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => onReactMessage(msg.id, emoji)}
                              className="size-6 flex items-center justify-center text-xs hover:bg-slate-100 rounded transition-transform active:scale-90"
                              title={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {isMe && (
                        <MessageFooter className="text-[10px] font-sans text-slate-400 justify-end pr-1">
                          Delivered
                        </MessageFooter>
                      )}
                    </MessageContent>
                  </Message>
                );
              })}
            </div>
          )}

          {/* Marker System Status Note (matching reference screenshot) */}
          <div className="flex justify-center my-4">
            <span className="text-[11px] font-sans px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center gap-1.5 shadow-2xs">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>User-6431 briefly disconnected and reconnected · Collapsed 4 noisy socket events</span>
            </span>
          </div>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Typing Indicator Bar using Shadcn Marker */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-1">
          <Marker role="status" className="border-0 p-0 text-xs">
            <MarkerContent className="font-mono flex items-center gap-1.5 text-slate-500">
              <span className="size-1.5 bg-indigo-500 rounded-full animate-ping" />
              <span className="font-semibold text-slate-900">
                {typingUsers.join(", ")}
              </span>{" "}
              {typingUsers.length === 1 ? "is typing..." : "are typing..."}
            </MarkerContent>
          </Marker>
        </div>
      )}

      {/* Bottom Message Input Area matching reference */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Quick Reaction Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5">
            <span className="text-[11px] font-sans font-medium text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="size-3 text-amber-500" /> Quick:
            </span>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.text}
                type="button"
                onClick={() => handleQuickAction(action.text)}
                className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs text-slate-700 transition-colors font-sans active:bg-slate-200"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Box matching reference screenshot */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-white border border-slate-200 shadow-2xs focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
          >
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              title="Add attachment"
            >
              <Plus className="size-4" />
            </button>

            <input
              value={inputMessage}
              onChange={handleInputChange}
              placeholder={`Message #${room.name}...`}
              className="flex-1 bg-transparent border-0 text-sm font-sans placeholder:text-slate-400 text-slate-900 outline-none px-2"
            />

            <div className="flex items-center gap-1 pr-1 text-slate-400">
              <button
                type="button"
                className="p-1 hover:text-slate-600 transition-colors text-xs font-bold font-serif"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                className="p-1 hover:text-slate-600 transition-colors"
                title="Insert emoji"
              >
                <Smile className="size-4" />
              </button>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={!inputMessage.trim()}
              className="h-8 px-3.5 gap-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white font-medium text-xs border border-slate-200 shadow-none transition-colors"
            >
              <Send className="size-3.5" />
              <span>Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
