"use client";

/**
 * Sélecteur de transport — acteur : JOUEUR (guest).
 *
 * Affiché sous la carte quand une zone de destination est sélectionnée :
 * 3 boutons (À pied / Gbaka / Moto Jakarta) issus de TRANSPORTS (data.ts) —
 * temps, coût, risque en tooltip. Confirmer = cliquer un mode → travelTo.
 * Options inabordables désactivées. Note pluie si `flags.pluie` (×1,5).
 */

import { X } from "lucide-react";
import { TRANSPORTS, ZONES } from "@/lib/game/data";
import { zoneById } from "@/lib/game/engine";
import type { GameState, TransportId, ZoneId } from "@/lib/game/types";
import { useGame } from "@/lib/game/store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GameIcon } from "@/components/guest/icons";
import { cn } from "@/lib/utils";

export interface TransportPickerProps {
  /** Zone de destination sélectionnée sur la carte (null → fermé). */
  target: ZoneId | null;
  /** Fermeture du picker (après voyage ou annulation). */
  onClose: () => void;
}

export function TransportPicker({ target, onClose }: TransportPickerProps) {
  const game = useGame((s) => s.game) as GameState | null;
  const travelTo = useGame((s) => s.travelTo);

  if (!target || !game) return null;

  const zone = zoneById(target) ?? ZONES[0];
  const raining = Boolean(game.flags.pluie);

  function confirmTravel(mode: TransportId) {
    travelTo(target as ZoneId, mode);
    onClose();
  }

  return (
    <section
      aria-label={`Choix du transport vers ${zone.name}`}
      className="game-panel border-tricolore rounded-xl p-3"
    >
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <h2 className="text-sm font-bold text-game-text">
          Aller à <span className="text-game-soleil">{zone.name}</span>
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Annuler le déplacement"
          className="size-9 min-h-9 min-w-9 text-game-muted hover:bg-game-bg/60 hover:text-game-text"
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      {raining && (
        <p className="mb-2 rounded-md bg-game-nuit/40 px-2.5 py-1.5 text-xs text-game-text/90">
          🌧 Il pleut sur Yop : les trajets durent ×1,5, pakè.
        </p>
      )}

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {TRANSPORTS.map((t) => {
          const affordable = game.money >= t.cost;
          const riskPercent = Math.round(t.riskChance * 100);
          return (
            <li key={t.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    onClick={() => confirmTravel(t.id)}
                    disabled={!affordable}
                    variant="outline"
                    className={cn(
                      "min-h-11 w-full justify-start gap-2.5 border-game-text/15 bg-game-bg/60 px-3 text-left text-game-text hover:bg-game-panel hover:text-game-text focus-visible:ring-game-soleil/60",
                      !affordable && "opacity-50",
                    )}
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-md bg-game-panel"
                      aria-hidden="true"
                    >
                      <GameIcon name={t.icon} size={16} className="text-game-soleil" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{t.label}</span>
                      <span className="block text-xs text-game-muted">
                        {t.minutes} min ·{" "}
                        {t.cost === 0 ? "Gratuit" : `${t.cost} F`}
                      </span>
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-56 border-game-panel bg-game-panel text-game-text">
                  <p className="font-semibold">
                    {t.minutes} min · {t.cost === 0 ? "Gratuit" : `${t.cost} F`} ·
                    énergie −{t.energy}
                  </p>
                  {t.riskChance > 0 ? (
                    <p className="mt-1 text-game-alerte">
                      Risque {riskPercent} % : {t.riskLabel}
                    </p>
                  ) : (
                    <p className="mt-1">Aucun risque connu. Fôô.</p>
                  )}
                  {!affordable && (
                    <p className="mt-1 font-semibold">
                      Pas assez de tchen ({game.money} F).
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
