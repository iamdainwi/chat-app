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
import { Hash, Plus, Loader2 } from "lucide-react";

interface NewRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated: (room: { id: string; name: string; description?: string }) => void;
}

export function NewRoomModal({ open, onOpenChange, onRoomCreated }: NewRoomModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cleanSlug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanSlug) {
      setError("Please enter a valid room name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const response = await fetch(`${apiUrl}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanSlug, description })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create room");
      }

      const createdRoom = await response.json();
      setName("");
      setDescription("");
      onRoomCreated(createdRoom);
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Hash className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create a Channel</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Channels are where discussions take place.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                #
              </span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. project-updates"
                className="pl-7"
                autoFocus
              />
            </div>
            {name && (
              <p className="text-xs text-muted-foreground">
                Will be created as <span className="font-mono text-primary font-medium">#{cleanSlug}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Topic / Description <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          <DialogFooter className="mt-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !cleanSlug}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-1.5" />
                  Create Channel
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
