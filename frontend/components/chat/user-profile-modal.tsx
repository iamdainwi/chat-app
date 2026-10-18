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
import { getAvatarGradient, getInitials } from "@/lib/avatar";

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

  const gradientClass = getAvatarGradient(username || "User");
  const initials = getInitials(username || "User");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Your Profile</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Set how you appear to others in the chat.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-center py-2 gap-3">
            <Avatar size="lg" className="size-16 ring-4 ring-primary/20 shadow-lg">
              <AvatarFallback className={`bg-gradient-to-tr ${gradientClass} text-white font-bold text-lg`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">Preview in chat</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Display Name
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={25}
              autoFocus
            />
          </div>

          <DialogFooter className="mt-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!username.trim()}>
              <Check className="size-4 mr-1.5" />
              Save Name
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
