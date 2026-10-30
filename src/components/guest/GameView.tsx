"use client";

/**
 * Écran JEU — acteur : JOUEUR (guest). Orchestrateur de la boucle de jeu.
 *
 * Desktop lg+ : 3 colonnes (carte 280px | centre flex-1 | journal 300px).
 * Mobile : pile verticale. Contient HUD, carte + picker transport, actions,
 * journal, dialogue, événement, résumé du jour, missions & glossaire (via HUD).
 *
 * Intro : si `game.flags.introSeen === false` au montage, ouvre le dialogue
 * d'ouverture de Momoh (lignes locales injectées dans le store via
 * `useGame.setState` — pas de talkToNpc requis) ; `advanceDialogue()` ferme
 * puis le store positionne `introSeen = true`.
 */

import { useEffect, useState } from "react";
import { isNight } from "@/lib/game/engine";
import type { ZoneId } from "@/lib/game/types";
import { useGame } from "@/lib/game/store";
import { ActionPanel } from "@/components/guest/ActionPanel";
import { CityMap } from "@/components/guest/CityMap";
import { DaySummary } from "@/components/guest/DaySummary";
import { DialogueBox } from "@/components/guest/DialogueBox";
import { EventDialog } from "@/components/guest/EventDialog";
import { GameHUD } from "@/components/guest/GameHUD";
import { JournalLog } from "@/components/guest/JournalLog";
import { TransportPicker } from "@/components/guest/TransportPicker";

/** Répliques exactes du dialogue d'intro (FEATURE-001, spec T-014). */
const INTRO_LINES: readonly string[] = [
  "Bienvenue à Yop, nouveau ! Moi c'est Momoh. Le jour de ton arrivée, j'ai « aidé » tes bagages… bref, tu as 2 000 F en poche. C'est Babi : on lève tôt !",
  "Gratte un premier djossi au carrefour Siporex, achète un matelas au marché, et dors dans ta chambre. Passe voir Tantie Rose au maquis — ici on vit ensemble. On a mis le pays, môgô !",
];

export function GameView() {
  const game = useGame((s) => s.game);
  const [target, setTarget] = useState<ZoneId | null>(null);

  // ——— Intro Momoh (une seule fois, avant tout autre dialogue) ———
  useEffect(() => {
    if (!game) return;
    if (game.flags.introSeen !== false) return;
    if (game.pendingEvent || game.pendingSummary) return;
    if (useGame.getState().dialogue) return;
    useGame.setState({
      dialogue: { npcId: "momoh", lines: [...INTRO_LINES], index: 0 },
    });
  }, [game]);

  if (!game) return null;

  const night = isNight(game.minute);

  return (
    <div
      className="bg-game-bg text-game-text transition-colors"
      style={
        night
          ? { backgroundImage: "linear-gradient(180deg, #101623 0%, #1a1410 42%)" }
          : undefined
      }
    >
      <GameHUD />

      <div className="mx-auto w-full max-w-6xl px-2 py-3 sm:px-4 lg:px-6">
        <h1 className="sr-only">
          Abidjan Hustle — partie de {game.name}, jour {game.day}
        </h1>

        <div className="grid items-start gap-3 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
          {/* ——— Colonne 1 : carte + transport ——— */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-[9.5rem]">
            <CityMap current={game.zone} onSelect={setTarget} />
            <TransportPicker target={target} onClose={() => setTarget(null)} />
          </div>

          {/* ——— Colonne 2 : zone + actions ——— */}
          <div className="min-w-0">
            <ActionPanel game={game} />
          </div>

          {/* ——— Colonne 3 : journal ——— */}
          <aside
            aria-label="Journal de bord"
            className="game-panel flex max-h-[32rem] flex-col overflow-hidden rounded-xl lg:sticky lg:top-[9.5rem] lg:max-h-[calc(100vh-11rem)]"
          >
            <JournalLog game={game} />
          </aside>
        </div>
      </div>

      {/* ——— Overlays globaux ——— */}
      <DialogueBox />
      <EventDialog game={game} />
      <DaySummary game={game} />
    </div>
  );
}
