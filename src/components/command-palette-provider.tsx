"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "./command-palette";

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = useCallback(
    (gameId: string) => {
      router.push(`/games/${gameId}`);
      setOpen(false);
    },
    [router]
  );

  return (
    <>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} onSelect={handleSelect} />
    </>
  );
}

export function CommandPaletteTrigger() {
  const handleClick = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Ouvrir la recherche (⌘K)"
    >
      <span>Rechercher</span>
      <kbd className="pointer-events-none rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium">
        ⌘K
      </kbd>
    </button>
  );
}
