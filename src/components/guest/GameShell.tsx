"use client";

/**
 * GameShell — acteur : JOUEUR (guest). Machine d'écrans du jeu (route `/`).
 *
 * MENU → CRÉATION → JEU selon `screen` du store Zustand. Gate d'hydratation :
 * le store persiste dans localStorage — on attend le montage côté client et on
 * affiche un skeleton « Noir Maquis » élégant avant, pour éviter tout mismatch
 * SSR (FEATURE-001_UX §5 : Loading = skeleton + « On arrive… »).
 */

import { useSyncExternalStore } from "react";
import { useGame } from "@/lib/game/store";
import { CharacterCreation } from "@/components/guest/CharacterCreation";
import { GameView } from "@/components/guest/GameView";
import { MainMenu } from "@/components/guest/MainMenu";

/** Abonnement vide : le gate de montage ne dépend d'aucun store externe. */
const noopSubscribe = () => () => {};

function BootSkeleton() {
  return (
    <div
      role="status"
      aria-label="Chargement du jeu"
      className="game-panel flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-none border-0"
    >
      <img
        src="/logo.svg"
        alt=""
        width={64}
        height={64}
        className="size-16 animate-pulse"
      />
      <p className="text-lg font-bold text-game-soleil">ABIDJAN HUSTLE</p>
      <p className="animate-pulse text-sm text-game-muted">On arrive…</p>
    </div>
  );
}

export function GameShell() {
  /* Gate d'hydratation (équivalent lint-safe du pattern useState(false) +
   * useEffect(() => setMounted(true)) : SSR/passage d'hydratation → false,
   * puis true après montage, sans setState dans un effet). */
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const screen = useGame((s) => s.screen);
  const game = useGame((s) => s.game);

  if (!mounted) return <BootSkeleton />;

  // Garde-fou : l'écran « game » sans partie (ex. reset) retombe sur le menu.
  const safeScreen = screen === "game" && !game ? "menu" : screen;

  if (safeScreen === "creation") return <CharacterCreation />;
  if (safeScreen === "game") return <GameView />;
  return <MainMenu />;
}
