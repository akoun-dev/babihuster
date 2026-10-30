import { GameShell } from "@/components/guest/GameShell";

/**
 * Route unique `/` — machine d'écrans du jeu « Abidjan Hustle » (ADR-003).
 *
 * Server component minimal : rendu du shell client (menu → création → jeu).
 * Aucune metadata ici : le layout racine s'en charge.
 *
 * @module app/page
 */
export default function HomePage() {
  return <GameShell />;
}
