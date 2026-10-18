"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Check } from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/avatar";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  onSaveUsername: (newUsername: string) => void;
}

export function UserProfileModal({
  open,
  onOpenChange,
  currentUsername,
  onSaveUsername,
}: UserProfileModalProps) {
  const [username, setUsername] = useState(currentUsername);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) {
      onSaveUsername(trimmed);
      onOpenChange(false);
    }
  };

  const avatarColor = getAvatarColor(username || "User");
  const initials = getInitials(username || "User");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <User className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-heading font-bold">Transmission Identity</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Set how your handle appears across all channels.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-center py-2 gap-2">
            <Avatar size="lg" className="size-16 rounded-md ring-2 ring-border">
              <AvatarFallback className={`${avatarColor} text-white font-mono font-bold text-xl rounded-md`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-mono text-muted-foreground uppercase">Avatar Stamped</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Callsign / Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Commander"
              maxLength={25}
              className="bg-background border-border font-heading font-semibold"
              autoFocus
            />
          </div>

          <DialogFooter className="mt-4 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-mono text-xs border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!username.trim()}
              className="font-mono text-xs font-semibold"
            >
              <Check className="size-3.5 mr-1.5" />
              Update Callsign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
