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
import { Plus, Loader2, Radio } from "lucide-react";

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
      setError("Please enter a valid channel name");
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
        throw new Error(data.error || "Failed to create channel");
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
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <Radio className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-heading font-bold">Create Frequency Channel</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                New real-time broadcast channel for team transmission.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Channel Identifier
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold text-sm">
                #
              </span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. system-core"
                className="pl-7 font-mono text-sm bg-background border-border rounded-md"
                autoFocus
              />
            </div>
            {name && (
              <p className="text-xs text-muted-foreground font-mono">
                Slug: <span className="text-primary font-bold">#{cleanSlug}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Topic / Purpose <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will be discussed here?"
              className="bg-background border-border rounded-md"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive text-destructive text-xs font-mono">
              [ERROR] {error}
            </div>
          )}

          <DialogFooter className="mt-4 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="font-mono text-xs border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !cleanSlug}
              className="font-mono text-xs font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-3.5 mr-1.5" />
                  Initialize Channel
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
