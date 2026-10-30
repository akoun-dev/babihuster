"use client";

/**
 * Pop-up d'événement aléatoire — acteur : JOUEUR (guest).
 *
 * Si `game.pendingEvent` : Dialog NON fermable (pas de X, pas d'Escape,
 * pas de clic extérieur) avec icône, titre, texte et boutons de choix.
 * Après `chooseEvent(c.id)`, l'`outcome` choisi est gardé en état local pour
 * la 2ᵉ étape (texte du résultat + « Continuer »).
 *
 * Icônes : mapping GameIcon (CloudRain, Cookie, ShieldAlert, Swords,
 * LightbulbOff, HandHeart…).
 */

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { GameState, Outcome } from "@/lib/game/types";
import { useGame } from "@/lib/game/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GameIcon } from "@/components/guest/icons";
import { NouchiText } from "@/components/guest/NouchiText";

export function EventDialog({ game }: { game: GameState }) {
  const chooseEvent = useGame((s) => s.chooseEvent);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const event = game.pendingEvent;
  const open = Boolean(event) || outcome !== null;

  function handleChoose(choiceId: string, chosen: Outcome) {
    setOutcome(chosen);
    chooseEvent(choiceId);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        // Non fermable tant que l'outcome n'a pas été consulté.
        if (!o && outcome) setOutcome(null);
      }}
    >
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="border-game-panel bg-game-bg text-game-text sm:max-w-md"
        role="alertdialog"
      >
        {event ? (
          <>
            <DialogHeader>
              <span
                className="mx-auto flex size-14 items-center justify-center rounded-full bg-game-panel ring-2 ring-game-alerte/50 sm:mx-0"
                aria-hidden="true"
              >
                <GameIcon name={event.icon} size={28} className="text-game-soleil" />
              </span>
              <DialogTitle className="mt-2 flex items-center gap-2 text-game-text">
                <AlertTriangle className="size-5 shrink-0 text-game-alerte" aria-hidden="true" />
                {event.title}
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed text-game-text/90">
                <NouchiText text={event.text} />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:flex-col sm:items-stretch">
              {event.choices.map((c) => (
                <Button
                  key={c.id}
                  onClick={() => handleChoose(c.id, c.outcome)}
                  className="min-h-11 w-full border-game-text/15 bg-game-panel text-left font-semibold text-game-text hover:bg-game-panel/80 sm:w-full"
                >
                  {c.label}
                </Button>
              ))}
            </DialogFooter>
          </>
        ) : outcome ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-game-text">
                Et alors…
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed text-game-text/90">
                <NouchiText text={outcome.text} />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setOutcome(null)}
                autoFocus
                className="min-h-11 w-full bg-game-soleil font-bold text-black hover:bg-game-soleil/90 sm:w-full"
              >
                Continuer
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
