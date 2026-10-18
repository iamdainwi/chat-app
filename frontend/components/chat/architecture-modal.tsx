"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Code, Check, Copy } from "lucide-react";
import { useState } from "react";

interface ArchitectureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SNIPPET = `import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"

export function ChatFeed() {
  return (
    <div className="flex flex-col gap-4">
      {/* Incoming Message */}
      <Message align="start">
        <MessageAvatar>
          <Avatar size="sm">
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>User-1945 12:26 PM</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>Hey! Welcome to the redesigned Pulse workspace.</BubbleContent>
            <BubbleReactions>👋 2</BubbleReactions>
          </Bubble>
        </MessageContent>
      </Message>

      {/* Outgoing Message */}
      <Message align="end">
        <MessageAvatar>
          <Avatar size="sm">
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>12:28 PM Alex (You)</MessageHeader>
          <Bubble variant="default">
            <BubbleContent>Deploying to prod real quick.</BubbleContent>
            <BubbleReactions>🚀 2</BubbleReactions>
          </Bubble>
          <MessageFooter>Delivered</MessageFooter>
        </MessageContent>
      </Message>

      {/* System Marker */}
      <Marker role="status">
        <MarkerContent>User-6431 connected</MarkerContent>
      </Marker>
    </div>
  )
}`;

export function ArchitectureModal({ open, onOpenChange }: ArchitectureModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Code className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-heading font-bold">
                Shadcn UI Chat Primitives Architecture
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Official composable structure powering this chat feed.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden rounded-lg bg-[#0b0f17] border border-[#1e293b] p-3 text-white">
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 px-2 py-1 rounded bg-[#1e293b] hover:bg-[#2d3a4f] text-[11px] font-mono flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            <span>{copied ? "Copied" : "Copy JSX"}</span>
          </button>

          <pre className="overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed pt-6">
            <code>{SNIPPET}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
