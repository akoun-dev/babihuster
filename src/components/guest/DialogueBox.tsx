"use client";

/**
 * Boîte de dialogue (style visual novel, bas d'écran) — acteur : JOUEUR.
 *
 * Visible quand `store.dialogue` est non null (PNJ de zone OU intro Momoh
 * injectée par GameView via `useGame.setState`). Réplique courante avec
 * surlignage nouchi (NouchiText), bouton Suivant / Fermer → advanceDialogue().
 * aria-live="polite" sur la réplique.
 */

import { ChevronRight, X } from "lucide-react";
import { npcById } from "@/lib/game/engine";
import { useGame } from "@/lib/game/store";
import { Button } from "@/components/ui/button";
import { NouchiText } from "@/components/guest/NouchiText";
import { GameIcon } from "@/components/guest/icons";

export function DialogueBox() {
  const dialogue = useGame((s) => s.dialogue);
  const advance = useGame((s) => s.advanceDialogue);

  if (!dialogue) return null;

  const npc = npcById(dialogue.npcId);
  const line = dialogue.lines[dialogue.index] ?? "";
  const isLast = dialogue.index >= dialogue.lines.length - 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:p-4">
      <div
        className="game-panel pointer-events-auto mx-auto max-w-2xl rounded-xl p-4 shadow-2xl shadow-black/60"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-game-bg/70 ring-2 ring-game-soleil/40"
            aria-hidden="true"
          >
            <GameIcon
              name={npc?.icon ?? "UserRound"}
              size={22}
              className="text-game-soleil"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-game-soleil">
              {npc?.name ?? dialogue.npcId}
              {npc?.role && (
                <span className="ml-2 text-xs font-medium text-game-muted">
                  {npc.role}
                </span>
              )}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-game-text">
              <NouchiText text={line} />
            </p>
            {dialogue.lines.length > 1 && (
              <p className="mt-1 text-[11px] text-game-muted tabular-nums">
                {dialogue.index + 1}/{dialogue.lines.length}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            onClick={advance}
            autoFocus
            className="min-h-11 bg-game-soleil px-5 font-bold text-black hover:bg-game-soleil/90"
          >
            {isLast ? (
              <>
                Fermer
                <X aria-hidden="true" />
              </>
            ) : (
              <>
                Suivant
                <ChevronRight aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
