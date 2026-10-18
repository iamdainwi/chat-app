"use client";

import { RoomUser } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, X } from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/avatar";

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
    <div className="w-64 h-full border-l border-border bg-sidebar/50 flex flex-col select-none">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Online Members ({users.length})
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
            const gradient = getAvatarGradient(u.username);
            const initials = getInitials(u.username);

            return (
              <div
                key={u.socketId}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar size="sm">
                    <AvatarFallback
                      className={`bg-gradient-to-tr ${gradient} text-white font-medium text-xs`}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2 bg-emerald-500 rounded-full ring-2 ring-background" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate flex items-center gap-1.5">
                    <span className="truncate">{u.username}</span>
                    {isMe && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        (you)
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-emerald-500">Active now</div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
