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
  Radio,
  Sliders,
  Database,
  Terminal,
  Server
} from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/avatar";

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

  const avatarColor = getAvatarColor(username);
  const initials = getInitials(username);

  return (
    <aside className="w-72 sm:w-80 h-full flex flex-col bg-sidebar border-r border-sidebar-border select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
              <Radio className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base tracking-tight text-sidebar-foreground">
                  PULSE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                  v1.0
                </span>
              </div>
            </div>
          </div>

          <Button
            size="icon-xs"
            variant="outline"
            onClick={onOpenNewRoomModal}
            title="Create Channel"
            className="border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        {/* Live Status Telegraph */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-secondary/60 border border-sidebar-border text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                socketConnected ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="text-secondary-foreground font-medium">
              {socketConnected ? "DISPATCH LIVE" : "CONNECTING"}
            </span>
          </div>
          <span className="text-muted-foreground text-[10px]">
            {socketConnected ? "PORT 5001" : "STANDBY"}
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="h-8 pl-8 text-xs font-sans bg-secondary/40 border-sidebar-border placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Channels Header */}
      <div className="px-3 py-1 flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
          Channels ({filteredRooms.length})
        </span>
        <button
          onClick={onOpenNewRoomModal}
          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
        >
          <Plus className="size-3" /> New
        </button>
      </div>

      {/* Channel Item List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5 py-1">
          {filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-xs font-mono text-muted-foreground">
              [No channels matched]
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = room.id === activeRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-md text-left transition-colors text-sm ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-sidebar-foreground"
                      }`}
                    >
                      #
                    </span>
                    <div className="truncate">
                      <div className="truncate font-heading text-xs sm:text-sm font-semibold tracking-tight">
                        {room.name}
                      </div>
                      {room.description && (
                        <div
                          className={`truncate text-[11px] ${
                            isActive
                              ? "text-primary-foreground/80"
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
                      variant="outline"
                      className={`text-[10px] font-mono ml-2 px-1.5 h-4 border ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                          : "bg-secondary text-secondary-foreground border-sidebar-border"
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

      {/* System Dispatch Specs (Solid Badges) */}
      <div className="px-3 py-2 bg-secondary/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5" title="PostgreSQL + Prisma ORM">
          <Database className="size-3 text-primary" />
          <span>Postgres</span>
        </div>
        <div className="flex items-center gap-1.5" title="Socket.io Real-Time Engine">
          <Terminal className="size-3 text-emerald-500" />
          <span>Socket.io</span>
        </div>
        <div className="flex items-center gap-1.5" title="Node.js ESM">
          <Server className="size-3 text-amber-500" />
          <span>Express</span>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* User Status Bar */}
      <div className="p-3 bg-sidebar flex items-center justify-between gap-2 border-t border-sidebar-border">
        <div
          onClick={onOpenProfileModal}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
        >
          <Avatar size="sm" className="shrink-0 rounded-md">
            <AvatarFallback
              className={`${avatarColor} text-white font-mono font-bold text-xs rounded-md`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate text-foreground font-heading">
              {username}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
              ONLINE
            </div>
          </div>
        </div>

        <Button
          size="icon-xs"
          variant="outline"
          onClick={onOpenProfileModal}
          title="Edit Display Name"
          className="border-sidebar-border hover:bg-sidebar-accent"
        >
          <Sliders className="size-3 text-muted-foreground" />
        </Button>
      </div>
    </aside>
  );
}
