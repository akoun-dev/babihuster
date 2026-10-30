"use client";

/**
 * Journal de bord — acteur : JOUEUR (guest).
 *
 * ScrollArea listant `game.journal` (le plus récent en premier, géré par le
 * moteur). Pastille de couleur par kind : info gris, good vert #009A44,
 * bad rouge #C43D2F, money or #F4B942. aria-live="polite".
 * État vide (jour 1) : « Ta première journée t'attend, môgô ! » (UX §5).
 */

import type { GameState, JournalKind } from "@/lib/game/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const KIND_STYLE: Record<JournalKind, { dot: string; text: string; label: string }> = {
  info: { dot: "bg-game-muted", text: "text-game-text/80", label: "Info" },
  good: { dot: "bg-game-vert", text: "text-game-text", label: "Bonne nouvelle" },
  bad: { dot: "bg-game-alerte", text: "text-game-text/90", label: "Mauvaise nouvelle" },
  money: { dot: "bg-game-soleil", text: "text-game-soleil", label: "Argent" },
};

export function JournalLog({ game }: { game: GameState }) {
  const entries = game.journal;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="border-b border-game-text/10 px-3 py-2.5 text-sm font-bold tracking-wide text-game-text uppercase">
        Journal
      </h2>
      <ScrollArea className="h-72 flex-1 lg:h-auto">
        <div aria-live="polite" className="px-3 py-2">
          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-game-muted">
              Ta première journée t&apos;attend, môgô !
            </p>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {entries.map((entry, i) => {
                const style = KIND_STYLE[entry.kind] ?? KIND_STYLE.info;
                return (
                  <li key={`${entry.t}-${i}`} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className={cn("mt-1.5 size-2 shrink-0 rounded-full", style.dot)}
                    />
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-[11px] font-semibold tabular-nums text-game-muted",
                        )}
                      >
                        <span className="sr-only">{style.label} — </span>
                        {entry.t}
                      </p>
                      <p className={cn("text-sm leading-snug", style.text)}>
                        {entry.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
