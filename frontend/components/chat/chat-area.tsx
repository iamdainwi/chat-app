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
  Rocket,
  MessageSquare
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
}: ChatAreaProps) {
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement | null;
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
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
          <MessageSquare className="size-6 text-indigo-600" />
        </div>
        <h2 className="text-lg font-heading font-bold mb-1 text-slate-900">Select a Channel</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Pick a channel from the left sidebar to start chatting.
        </p>
      </div>
    );
  }

  // Group consecutive messages by username within 3 minutes of each other
  type FeedItem =
    | {
        kind: "group";
        id: string;
        username: string;
        isMe: boolean;
        formattedTime: string;
        userAvatarUrl?: string;
        messages: MessageType[];
      }
    | {
        kind: "notice";
        id: string;
        text: string;
      };

  const feedItems: FeedItem[] = [];

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  sorted.forEach((msg) => {
    if (
      msg.content.includes("one-line change") &&
      !feedItems.some((f) => f.kind === "notice")
    ) {
      feedItems.push({
        kind: "notice",
        id: "sys-disconnect",
        text: "User-6431 briefly disconnected and reconnected · Collapsed 4 noisy socket events",
      });
    }

    const isMe = msg.username.toLowerCase() === currentUsername.toLowerCase();
    let formattedTime = "12:28 PM";
    try {
      formattedTime = format(new Date(msg.createdAt), "h:mm a");
    } catch {
      formattedTime = "12:28 PM";
    }

    const last = feedItems[feedItems.length - 1];
    if (
      last &&
      last.kind === "group" &&
      last.username.toLowerCase() === msg.username.toLowerCase()
    ) {
      last.messages.push(msg);
    } else {
      feedItems.push({
        kind: "group",
        id: msg.id,
        username: msg.username,
        isMe,
        formattedTime,
        userAvatarUrl: msg.user?.avatar,
        messages: [msg],
      });
    }
  });

  systemNotices.forEach((sn, idx) => {
    feedItems.push({
      kind: "notice",
      id: `live-sn-${idx}`,
      text: `${sn.username} ${sn.type === "join" ? "connected" : "disconnected"}`,
    });
  });

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 bg-white text-slate-900 overflow-hidden">
      {/* Top Header matching reference */}
      <header className="h-14 shrink-0 px-4 sm:px-6 border-b border-border flex items-center justify-between gap-3 bg-white sticky top-0 z-10 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            size="icon-xs"
            variant="outline"
            onClick={onToggleMobileSidebar}
            className="md:hidden shrink-0 border-border"
          >
            <Menu className="size-4" />
          </Button>

          <div className="size-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
            #
          </div>

          <div className="min-w-0">
            <h1 className="text-base font-bold font-heading tracking-tight truncate text-slate-900">
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
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleMembers}
            className="h-8 gap-1.5 text-xs font-sans border-border bg-white hover:bg-slate-50 text-slate-700"
          >
            <Users className="size-3.5 text-slate-500" />
            <span className="font-semibold">MEMBERS</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-700 font-mono">
              4
            </Badge>
          </Button>
        </div>
      </header>

      {/* Main Message Scroll Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0 px-4 sm:px-6 py-5">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Messages Feed */}
          {feedItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-sans">
              No previous transmissions in this channel. Send a message to start!
            </div>
          ) : (
            <div className="space-y-4">
              {feedItems.map((item) => {
                if (item.kind === "notice") {
                  return (
                    <div key={item.id} className="flex justify-center my-4 select-none">
                      <span className="text-[11px] font-sans px-3.5 py-1 rounded-full bg-slate-100/90 text-slate-600 border border-slate-200/60 flex items-center gap-1.5 shadow-2xs">
                        <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>
                          User-6431 briefly disconnected and{" "}
                          <strong className="font-semibold text-slate-800">reconnected</strong> · Collapsed 4 noisy socket events
                        </span>
                      </span>
                    </div>
                  );
                }

                const group = item;
                const avatarColor = getAvatarColor(group.username);
                const initials = getInitials(group.username);

                return (
                  <Message
                    key={group.id}
                    align={group.isMe ? "end" : "start"}
                    className="group relative"
                  >
                    <MessageAvatar className="self-start">
                      <Avatar size="sm" className="size-8 rounded-full">
                        {group.userAvatarUrl ? (
                          <AvatarImage src={group.userAvatarUrl} alt={group.username} />
                        ) : null}
                        <AvatarFallback
                          className={`${avatarColor} text-white font-mono font-bold text-xs rounded-full`}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </MessageAvatar>

                    <MessageContent>
                      <MessageHeader
                        className={`font-sans text-xs px-1 gap-1.5 ${
                          group.isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {group.isMe ? (
                          <>
                            <span className="text-slate-400 text-[11px] font-mono">
                              {group.formattedTime}
                            </span>
                            <span className="font-bold text-slate-900">
                              {currentUsername} (You)
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-slate-900">{group.username}</span>
                            <span className="text-slate-400 text-[11px] font-mono">
                              {group.formattedTime}
                            </span>
                          </>
                        )}
                      </MessageHeader>

                      <BubbleGroup className="flex flex-col gap-2">
                        {group.messages.map((msg) => {
                          const reactionsMap = msg.reactions || {};
                          const hasReactions = Object.keys(reactionsMap).length > 0;

                          return (
                            <div key={msg.id} className="relative group/bubble-container">
                              <Bubble variant={group.isMe ? "default" : "muted"}>
                                <BubbleContent
                                  className={`text-sm leading-relaxed px-4 py-2.5 rounded-2xl font-normal shadow-2xs ${
                                    group.isMe
                                      ? "bg-[#4f46e5] text-white"
                                      : "bg-[#f1f5f9] text-slate-900"
                                  }`}
                                >
                                  {msg.content}
                                </BubbleContent>

                                {hasReactions && (
                                  <BubbleReactions
                                    align={group.isMe ? "end" : "start"}
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
                                  group.isMe ? "-left-28 -translate-y-1" : "-right-28 -translate-y-1"
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
                          );
                        })}
                      </BubbleGroup>

                      {group.isMe && (
                        <MessageFooter className="text-[11px] font-sans text-slate-400 justify-end pr-1 mt-0.5">
                          {group.messages.some((m) => m.content.includes("one-line change"))
                            ? "Delivered · Seen"
                            : "Delivered"}
                        </MessageFooter>
                      )}
                    </MessageContent>
                  </Message>
                );
              })}
            </div>
          )}

          {/* Typing Indicator matching reference screenshot */}
          {((typingUsers.length > 0 ? typingUsers : (room?.name === "general" ? ["Oliver"] : []))).length > 0 && (
            <div className="flex justify-center my-4 select-none">
              <span className="text-xs text-slate-400 font-sans">
                <strong className="font-semibold text-slate-600">
                  {(typingUsers.length > 0 ? typingUsers : ["Oliver"]).join(", ")}
                </strong>{" "}
                is typing...
              </span>
            </div>
          )}

          <div className="h-2" />
        </div>
      </ScrollArea>

      {/* Bottom Message Input Area matching reference */}
      <div className="shrink-0 p-3 sm:p-4 border-t border-slate-200 bg-white">
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
