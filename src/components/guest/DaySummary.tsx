"use client";

/**
 * Résumé de fin de journée — acteur : JOUEUR (guest).
 *
 * Affiché quand `game.pendingSummary` : gains/dépenses, réputation, tontine
 * à venir, bouton « Jour suivant → » → store.endDay().
 *
 * ⚠ Contournement UI d'un artefact moteur (engine figé, T-014 ne peut pas le
 * modifier) : l'action « dormir » avance déjà J+1 ET remet `dayStats` à zéro
 * AVANT l'affichage du résumé. Pour afficher les vrais chiffres du jour qui
 * vient de se terminer, on mémorise les dayStats de la dernière « journée
 * ouverte » dans un cache externe (clé = référence du GameState — pattern
 * sans ref React ni setState, compatible render pass idempotent). Le chemin
 * « écroulement » (flags.collapsed) ne remet rien à zéro : valeurs courantes.
 */

import { Coins, ReceiptText, Sun, TrendingDown, TrendingUp } from "lucide-react";
import type { GameState } from "@/lib/game/types";
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

const fmt = new Intl.NumberFormat("fr-FR");

interface DaySnap {
  day: number;
  earned: number;
  spent: number;
}

/** Cache externe (hors React) : dayStats de la dernière journée ouverte. */
const snapCache: { game: GameState | null; snap: DaySnap } = {
  game: null,
  snap: { day: 1, earned: 0, spent: 0 },
};

/**
 * Snapshot idempotent : tant que `game` ne change pas, renvoie exactement le
 * même objet (identité stable). Quand la journée est ouverte, met à jour le
 * cache ; quand le résumé est ouvert (journée déjà clôturée par le moteur),
 * préserve la dernière valeur mémorisée.
 */
function snapshotFor(game: GameState): DaySnap {
  if (snapCache.game === game) return snapCache.snap;
  if (!game.pendingSummary) {
    snapCache.snap = {
      day: game.day,
      earned: game.dayStats.earned,
      spent: game.dayStats.spent,
    };
  } else if (snapCache.game === null) {
    // Montage direct en plein résumé (ex. rechargement de page) : les stats
    // d'origine sont perdues (remises à 0 par le moteur) — valeur au mieux.
    snapCache.snap = {
      day: Math.max(1, game.day - 1),
      earned: game.dayStats.earned,
      spent: game.dayStats.spent,
    };
  }
  snapCache.game = game;
  return snapCache.snap;
}

export function DaySummary({ game }: { game: GameState }) {
  const endDay = useGame((s) => s.endDay);

  // ⚠ Appelé À CHAQUE rendu (avant tout early-return) : c'est lui qui tient
  // le cache à jour pendant la journée ouverte, pour que le résumé affiche
  // les vrais chiffres du jour écoulé (le moteur les remet à zéro en dormant).
  const cached = snapshotFor(game);

  if (!game.pendingSummary) return null;

  const collapsed = Boolean(game.flags.collapsed);
  const snap = collapsed
    ? { day: game.day, earned: game.dayStats.earned, spent: game.dayStats.spent }
    : cached;

  const tontineUpcoming =
    game.tontine.member && game.tontine.payoutDay !== null
      ? game.tontine.payoutDay
      : null;

  return (
    <Dialog open onOpenChange={() => undefined}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="border-game-panel bg-game-bg text-game-text sm:max-w-sm"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-game-text">
            <Sun className="size-5 text-game-soleil" aria-hidden="true" />
            Résumé du Jour {snap.day}
          </DialogTitle>
          <DialogDescription className="text-game-muted">
            {collapsed
              ? "Tu t'es écroulé à 02:00 — le gbonhi t'a ramené. Yako…"
              : "Le soleil se lève sur Yopougon."}
          </DialogDescription>
        </DialogHeader>

        <dl className="flex flex-col gap-2 rounded-lg bg-game-panel/70 p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-game-muted">
              <TrendingUp className="size-4 text-game-vert" aria-hidden="true" />
              Gains du jour
            </dt>
            <dd className="font-bold tabular-nums text-game-vert">
              +{fmt.format(snap.earned)} F
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-game-muted">
              <TrendingDown className="size-4 text-game-alerte" aria-hidden="true" />
              Dépenses du jour
            </dt>
            <dd className="font-bold tabular-nums text-game-alerte">
              −{fmt.format(snap.spent)} F
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-game-muted">
              <Coins className="size-4 text-game-soleil" aria-hidden="true" />
              Réputation
            </dt>
            <dd className="font-bold tabular-nums text-game-text">{game.rep} / 100</dd>
          </div>
          {tontineUpcoming !== null && (
            <div className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-1.5 text-game-muted">
                <ReceiptText className="size-4 text-game-soleil" aria-hidden="true" />
                Tontine
              </dt>
              <dd className="font-bold text-game-soleil">
                Payout J{tontineUpcoming}
              </dd>
            </div>
          )}
        </dl>

        <DialogFooter>
          <Button
            onClick={endDay}
            className="min-h-11 w-full bg-game-soleil font-bold text-black hover:bg-game-soleil/90"
          >
            Jour suivant →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
