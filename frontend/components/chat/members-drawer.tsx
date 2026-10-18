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

export function MembersDrawer({
  users,
  currentUsername,
  onClose,
}: MembersDrawerProps) {
  // Build dynamic member list from live room users
  const memberMap = new Map<
    string,
    { username: string; isCurrentUser: boolean; isOnline: boolean }
  >();

  // Include current user
  if (currentUsername) {
    memberMap.set(currentUsername.toLowerCase(), {
      username: currentUsername,
      isCurrentUser: true,
      isOnline: true,
    });
  }

  // Include all live users in the room
  users.forEach((u) => {
    const isCurrentUser =
      u.username.toLowerCase() === currentUsername.toLowerCase();
    memberMap.set(u.username.toLowerCase(), {
      username: u.username,
      isCurrentUser,
      isOnline: true,
    });
  });

  const memberList = Array.from(memberMap.values());

  return (
    <div className="w-72 sm:w-80 h-full min-h-0 border-l border-border bg-white text-foreground flex flex-col select-none">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-border flex items-center justify-between">
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
      <ScrollArea className="flex-1 min-h-0 p-3">
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
                      m.isOnline ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold font-sans truncate text-foreground">
                    {m.username}{" "}
                    {m.isCurrentUser && (
                      <span className="font-normal text-muted-foreground">
                        (You)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {m.isCurrentUser ? "Online" : "Member"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
