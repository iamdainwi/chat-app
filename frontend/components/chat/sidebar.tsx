"use client";

import { useState } from "react";
import { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Kbd } from "@/components/ui/kbd";
import {
  Radio,
  Plus,
  Search,
  Moon,
  Settings,
  Sparkles,
} from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/avatar";

interface SidebarProps {
  rooms: Room[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onOpenNewRoomModal: () => void;
  onOpenProfileModal: () => void;
  onOpenArchitectureModal?: () => void;
  username: string;
  socketConnected: boolean;
}

const DIRECT_MESSAGES = [
  { name: "Alex (You)", role: "Lead Frontend", online: true },
  { name: "User-1945", role: "Systems Engineer", online: true },
  { name: "User-6431", role: "DevOps / SRE", online: true },
  { name: "Oliver", role: "Staff Reviewer", online: false },
];

export function Sidebar({
  rooms,
  activeRoomId,
  onSelectRoom,
  onOpenNewRoomModal,
  onOpenProfileModal,
  onOpenArchitectureModal,
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
    <aside className="w-72 sm:w-80 h-full flex flex-col bg-[#0b0f17] text-white border-r border-[#1e293b] select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1e293b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#1c2433] border border-[#2d3748] text-white flex items-center justify-center shadow-xs">
              <Radio className="size-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-base tracking-tight text-white">
                  PULSE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1e293b] text-slate-300">
                  v1.0
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                Dispatch Live
              </div>
            </div>
          </div>

          <button
            className="p-1.5 rounded-md hover:bg-[#1c2433] text-slate-400 hover:text-white transition-colors"
            title="Toggle theme"
          >
            <Moon className="size-4" />
          </button>
        </div>
      </div>

      {/* Search Input with ⌘K */}
      <div className="p-3">
        <div className="relative">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="h-9 pl-9 pr-8 text-xs bg-[#131b2a] border-[#222f42] text-white placeholder:text-slate-400 rounded-lg focus-visible:ring-1 focus-visible:ring-indigo-500"
          />
          <Kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-[#1c2536] text-slate-400 border border-[#2d3a4f] h-4 px-1">
            ⌘K
          </Kbd>
        </div>
      </div>

      {/* Scrollable Navigation Sections */}
      <ScrollArea className="flex-1 px-3">
        {/* Channels Section */}
        <div className="mb-4">
          <div className="px-1 py-1 flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            <span>CHANNELS ({filteredRooms.length})</span>
            <button
              onClick={onOpenNewRoomModal}
              className="text-slate-300 hover:text-white flex items-center gap-1 text-xs normal-case font-sans"
            >
              <Plus className="size-3" /> New
            </button>
          </div>

          <div className="space-y-1 mt-1">
            {filteredRooms.map((room) => {
              const isActive = room.id === activeRoomId;
              const hasBadge = room.messageCount && room.messageCount > 0;
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    isActive
                      ? "bg-[#4f46e5] text-white font-medium shadow-xs"
                      : "text-slate-300 hover:bg-[#151d2c] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`font-mono text-xs ${isActive ? "text-white" : "text-slate-400"}`}>
                      #
                    </span>
                    <span className="truncate font-sans text-xs sm:text-sm">
                      {room.name}
                    </span>
                  </div>

                  {hasBadge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#1f293d] text-slate-300"
                      }`}
                    >
                      {room.messageCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="mb-4">
          <div className="px-1 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            DIRECT MESSAGES
          </div>

          <div className="space-y-1 mt-1">
            {DIRECT_MESSAGES.map((dm) => (
              <div
                key={dm.name}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[#151d2c] text-xs text-slate-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`size-1.5 rounded-full shrink-0 ${
                      dm.online ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="truncate font-medium">{dm.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 truncate ml-2 font-mono">
                  {dm.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shadcn UI Architecture Card */}
        <div className="p-3 rounded-xl bg-[#121927] border border-[#222f42] text-xs text-slate-300 mb-4">
          <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
            <Sparkles className="size-3.5 text-indigo-400" />
            <span>shadcn/ui Architecture</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
            Built with composable <code className="text-indigo-300">&lt;Message&gt;</code>, <code className="text-indigo-300">&lt;Bubble&gt;</code> &amp; <code className="text-indigo-300">&lt;Marker&gt;</code> primitives.
          </p>
          <button
            onClick={onOpenArchitectureModal}
            className="w-full py-1.5 px-2 rounded-md bg-[#1a2334] hover:bg-[#232f45] border border-[#2a3850] text-[11px] font-medium text-white transition-colors"
          >
            View UI Audit &amp; Changes
          </button>
        </div>
      </ScrollArea>

      {/* User Status Profile Bar */}
      <div className="p-3 bg-[#0e1420] border-t border-[#1e293b] flex items-center justify-between">
        <div
          onClick={onOpenProfileModal}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity min-w-0"
        >
          <Avatar size="sm" className="size-8 rounded-full">
            <AvatarFallback className="bg-rose-600 text-white font-mono font-bold text-xs rounded-full">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {username}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 font-mono">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
              ONLINE
            </div>
          </div>
        </div>

        <button
          onClick={onOpenProfileModal}
          className="p-1.5 rounded-md hover:bg-[#1a2334] text-slate-400 hover:text-white transition-colors"
          title="User Settings"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </aside>
  );
}
