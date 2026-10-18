"use client";

import { RoomUser } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/avatar";

interface MembersDrawerProps {
  users: RoomUser[];
  currentUsername: string;
  onClose?: () => void;
}

const DEFAULT_MEMBERS = [
  { username: "Alex", role: "Lead Frontend", isOnline: true },
  { username: "User-1945", role: "Systems Engineer", isOnline: true },
  { username: "User-6431", role: "DevOps / SRE", isOnline: true },
  { username: "Oliver", role: "Staff Reviewer", isOnline: false },
];

export function MembersDrawer({
  users,
  currentUsername,
  onClose,
}: MembersDrawerProps) {
  // Merge live room users with member list
  const memberList = DEFAULT_MEMBERS.map((m) => {
    const isCurrentUser = m.username.toLowerCase() === currentUsername.toLowerCase();
    const liveOnline = users.some((u) => u.username.toLowerCase() === m.username.toLowerCase());
    return {
      ...m,
      isCurrentUser,
      isOnline: liveOnline || m.isOnline,
    };
  });

  return (
    <div className="w-72 sm:w-80 h-full border-l border-border bg-white text-foreground flex flex-col select-none">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          CHANNEL MEMBERS ({memberList.length})
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Member Cards */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {memberList.map((m) => {
            const avatarColor = getAvatarColor(m.username);
            const initials = getInitials(m.username);

            return (
              <div
                key={m.username}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/60 transition-colors"
              >
                <div className="relative">
                  <Avatar size="sm" className="size-9 rounded-full">
                    <AvatarFallback
                      className={`${avatarColor} text-white font-mono font-bold text-xs rounded-full`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-white ${
                      m.isOnline ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold font-sans truncate text-foreground">
                    {m.username} {m.isCurrentUser && <span className="font-normal text-muted-foreground">(You)</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {m.role}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Shadcn Primitives Active Info Card */}
      <div className="p-3 border-t border-border bg-white">
        <div className="p-3.5 rounded-xl bg-[#f8faff] border border-indigo-100 text-xs">
          <div className="font-heading font-semibold text-slate-800 mb-2">
            shadcn Primitives Active
          </div>
          <div className="space-y-1 font-mono text-[11px] text-indigo-700">
            <div>• &lt;Message align=&quot;end&quot;&gt;</div>
            <div>• &lt;Bubble variant=&quot;muted&quot;&gt;</div>
            <div>• &lt;BubbleGroup&gt;</div>
            <div>• &lt;BubbleReactions&gt;</div>
            <div>• &lt;Marker role=&quot;status&quot;&gt;</div>
          </div>
        </div>
      </div>
    </div>
  );
}
