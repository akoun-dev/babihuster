"use client";

/**
 * Carte de Yopougon — acteur : JOUEUR (guest).
 *
 * Grille des 6 zones (ZONES, data.ts) : Card cliquable par zone avec icône
 * (mapping Lucide), nom, sous-titre. La zone courante porte une bordure
 * Terre Rouge + badge « Tu es ici ». Cliquer une autre zone transmet la
 * destination au parent (GameView) qui ouvre le TransportPicker.
 *
 * FEATURE-001_UX §6 : zone active = bordure Terre Rouge ; cibles ≥ 44px.
 */

import { MapPin } from "lucide-react";
import { ZONES } from "@/lib/game/data";
import type { ZoneId } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { GameIcon } from "@/components/guest/icons";

export interface CityMapProps {
  /** Zone où se trouve le joueur (game.zone). */
  current: ZoneId;
  /** Destination choisie par le joueur (≠ zone courante). */
  onSelect: (zone: ZoneId) => void;
}

export function CityMap({ current, onSelect }: CityMapProps) {
  return (
    <section aria-label="Carte de Yopougon" className="game-panel rounded-xl p-3">
      <h2 className="flex items-center gap-2 px-1 pb-2 text-sm font-bold tracking-wide text-game-text uppercase">
        <MapPin className="size-4 text-game-terre" aria-hidden="true" />
        Yopougon
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {ZONES.map((zone) => {
          const here = zone.id === current;
          return (
            <li key={zone.id}>
              <button
                type="button"
                onClick={() => {
                  if (!here) onSelect(zone.id);
                }}
                disabled={here}
                aria-current={here ? "true" : undefined}
                aria-label={
                  here
                    ? `${zone.name} — tu es ici`
                    : `Aller à ${zone.name} (${zone.subtitle})`
                }
                className={cn(
                  "game-panel group flex min-h-[52px] w-full items-center gap-2.5 rounded-lg p-2.5 text-left transition-colors",
                  "hover:bg-game-panel/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-soleil/60",
                  here && "game-zone-active cursor-default",
                )}
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-md bg-game-bg/60"
                  style={{ color: zone.color }}
                  aria-hidden="true"
                >
                  <GameIcon name={zone.icon} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-game-text">
                    {zone.name}
                  </span>
                  <span
                    className="block truncate text-xs"
                    style={{ color: zone.color }}
                  >
                    {zone.subtitle}
                  </span>
                </span>
                {here && (
                  <span className="shrink-0 rounded-full bg-game-terre px-2 py-0.5 text-[10px] font-bold text-white">
                    Tu es ici
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
