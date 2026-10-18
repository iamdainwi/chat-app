"use client";

import { RoomUser } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, X } from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/avatar";

interface MembersDrawerProps {
  users: RoomUser[];
  currentUsername: string;
  onClose?: () => void;
}

export function MembersDrawer({
  users,
  currentUsername,
  onClose,
}: MembersDrawerProps) {
  return (
    <div className="w-64 h-full border-l border-border bg-sidebar flex flex-col select-none">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Members Online ({users.length})
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {users.map((u) => {
            const isMe = u.username === currentUsername;
            const avatarColor = getAvatarColor(u.username);
            const initials = getInitials(u.username);

            return (
              <div
                key={u.socketId}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-sidebar-accent transition-colors"
              >
                <div className="relative">
                  <Avatar size="sm" className="rounded-md">
                    <AvatarFallback
                      className={`${avatarColor} text-white font-mono font-bold text-xs rounded-md`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2 bg-emerald-500 rounded-full ring-2 ring-sidebar" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate flex items-center gap-1.5 font-heading">
                    <span className="truncate">{u.username}</span>
                    {isMe && (
                      <span className="text-[10px] font-mono text-muted-foreground font-normal">
                        [you]
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">ACTIVE</div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
