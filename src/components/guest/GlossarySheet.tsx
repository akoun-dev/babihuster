"use client";

/**
 * Glossaire Nouchi — acteur : JOUEUR (guest).
 *
 * Sheet latérale listant GLOSSARY (data.ts) avec recherche simple.
 * Auto-contenue : bouton déclencheur passé via `trigger` (MainMenu, GameHUD).
 */

import { useMemo, useState, type ReactNode } from "react";
import { BookOpen, Search } from "lucide-react";
import { GLOSSARY } from "@/lib/game/data";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface GlossarySheetProps {
  /** Déclencheur (Button) rendu via SheetTrigger asChild. */
  trigger: ReactNode;
}

export function GlossarySheet({ trigger }: GlossarySheetProps) {
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter(
      (e) =>
        e.word.toLowerCase().includes(q) || e.def.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 border-game-panel bg-game-bg text-game-text sm:max-w-sm">
        <SheetHeader className="border-b border-game-text/10">
          <SheetTitle className="flex items-center gap-2 text-game-text">
            <BookOpen className="size-5 text-game-soleil" aria-hidden="true" />
            Glossaire Nouchi
          </SheetTitle>
          <SheetDescription className="text-game-muted">
            Le petit lexique de Yop, pour piger chaque replique.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 py-3">
          <label className="sr-only" htmlFor="glossary-search">
            Rechercher un mot du glossaire
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-game-muted"
              aria-hidden="true"
            />
            <Input
              id="glossary-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (môgô, djossi…)"
              className="min-h-11 border-game-text/15 bg-game-panel pl-8 text-game-text placeholder:text-game-muted/70 focus-visible:ring-game-soleil/50"
            />
          </div>
        </div>

        <ul
          aria-live="polite"
          className="flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] [scrollbar-gutter:stable]"
        >
          {entries.length === 0 ? (
            <li className="py-8 text-center text-sm text-game-muted">
              Aucun mot trouvé pour « {query} ».
            </li>
          ) : (
            entries.map((entry) => (
              <li
                key={entry.word}
                className="game-panel mb-2 rounded-lg p-3 last:mb-0"
              >
                <p className="text-sm font-semibold text-game-soleil">
                  {entry.word}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-game-text/90">
                  {entry.def}
                </p>
              </li>
            ))
          )}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
