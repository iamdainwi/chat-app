"use client";

import { useState } from "react";
import { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Hash,
  Plus,
  Search,
  MessageSquare,
  Radio,
  Settings,
  Database,
  Layers
} from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/avatar";

interface SidebarProps {
  rooms: Room[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onOpenNewRoomModal: () => void;
  onOpenProfileModal: () => void;
  username: string;
  socketConnected: boolean;
}

export function Sidebar({
  rooms,
  activeRoomId,
  onSelectRoom,
  onOpenNewRoomModal,
  onOpenProfileModal,
  username,
  socketConnected,
}: SidebarProps) {
  const [search, setSearch] = useState("");

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  const gradientClass = getAvatarGradient(username);
  const initials = getInitials(username);

  return (
    <aside className="w-72 sm:w-80 h-full flex flex-col bg-sidebar border-r border-sidebar-border select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-base tracking-tight">PulseChat</span>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-muted/60">
                v1.0
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <span
                className={`size-2 rounded-full ${
                  socketConnected
                    ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-amber-500"
                }`}
              />
              <span className="text-[11px] font-medium">
                {socketConnected ? "Socket Connected" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>

        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onOpenNewRoomModal}
          title="Create New Channel"
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Room Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="h-8 pl-8 text-xs bg-sidebar-accent/40 border-sidebar-border"
          />
        </div>
      </div>

      {/* Channels List */}
      <div className="px-3 py-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Channels ({filteredRooms.length})
        </span>
        <button
          onClick={onOpenNewRoomModal}
          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
        >
          <Plus className="size-3" /> New
        </button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-1">
          {filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No channels found.
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors text-sm ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Hash
                      className={`size-4 shrink-0 ${
                        isActive
                          ? "text-sidebar-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    <div className="truncate">
                      <div className="truncate font-medium text-xs sm:text-sm">
                        {room.name}
                      </div>
                      {room.description && (
                        <div
                          className={`truncate text-[11px] ${
                            isActive
                              ? "text-sidebar-primary-foreground/75"
                              : "text-muted-foreground"
                          }`}
                        >
                          {room.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {typeof room.messageCount === "number" && room.messageCount > 0 && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className={`text-[10px] ml-2 px-1.5 h-4 ${
                        isActive
                          ? "bg-white/20 text-white border-transparent"
                          : "text-muted-foreground"
                      }`}
                    >
                      {room.messageCount}
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      {/* Tech Stack Info Strip */}
      <div className="px-3 py-2 bg-sidebar-accent/20 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5" title="Containerized Postgres + Prisma ORM">
          <Database className="size-3 text-emerald-500" />
          <span>Postgres + Prisma</span>
        </div>
        <div className="flex items-center gap-1.5" title="Real-time Socket.io monorepo">
          <Radio className="size-3 text-indigo-500" />
          <span>Socket.io</span>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Current User Card */}
      <div className="p-3 bg-sidebar-accent/30 flex items-center justify-between gap-2">
        <div
          onClick={onOpenProfileModal}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <Avatar size="sm" className="ring-2 ring-primary/20 shrink-0">
            <AvatarFallback
              className={`bg-gradient-to-tr ${gradientClass} text-white font-semibold text-xs`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate text-foreground">
              {username}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
              Online
            </div>
          </div>
        </div>

        <Button
          size="icon-xs"
          variant="ghost"
          onClick={onOpenProfileModal}
          title="Edit Display Name"
          className="hover:bg-sidebar-accent"
        >
          <Settings className="size-3.5 text-muted-foreground" />
        </Button>
      </div>
    </aside>
  );
}
