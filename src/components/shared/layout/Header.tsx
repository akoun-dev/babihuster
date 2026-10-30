import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { APP_BADGE, APP_NAME } from "@/lib/app-config";

/**
 * Header partagé — acteur : shared (tous acteurs).
 *
 * En-tête global affiché sur toutes les pages :
 * - Logo + titre du projet (APP_NAME) + badge vertical slice (APP_BADGE).
 * - Pas de navigation d'ancres : le jeu vit sur la route unique `/`
 *   (ADR-003), la machine d'écrans est gérée dans le contenu.
 *
 * Comportement :
 * - Sticky en haut de viewport (le footer est géré par `Footer`).
 * - Lien tactile >= 44px (`min-h-11`) et focus visible (ring shadcn).
 *
 * @module shared/layout/Header
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={`${APP_NAME} — retour à l'accueil`}
          className="flex min-h-11 items-center gap-2.5 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {/* Logo décoratif : le nom du projet est porté par le texte adjacent. */}
          <img
            src="/logo.svg"
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0"
          />
          {/* Texte masqué < 400px pour garantir zéro débordement horizontal
              (le lien conserve son aria-label complet). */}
          <span className="hidden min-[400px]:inline font-semibold tracking-tight">
            {APP_NAME}
          </span>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {APP_BADGE}
          </Badge>
        </Link>
      </div>
    </header>
  );
}
