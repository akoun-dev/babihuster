import { Badge } from "@/components/ui/badge";

/**
 * Footer partagé — acteur : shared (tous acteurs).
 *
 * Pied de page global :
 * - Sticky bas de viewport : garanti par le wrapper racine du layout
 *   (`min-h-screen flex flex-col`) + `mt-auto` sur ce footer. Contenu court
 *   → collé en bas ; contenu long → poussé naturellement, jamais en overlay.
 * - Respecte la safe-area iOS via `pb-[env(safe-area-inset-bottom)]`.
 *
 * @module shared/layout/Footer
 */
export function Footer() {
  // Année figée au build (server component statique) — décision assumée et tracée
  // dans .ai/LESSONS_LEARNED.md (LL-003) et .ai/TASKS.xlsx (D-002).
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          {/* Logo décoratif : le nom du projet est porté par le texte adjacent. */}
          <img
            src="/logo.svg"
            alt=""
            width={24}
            height={24}
            className="size-6 shrink-0"
          />
          <p className="text-sm text-muted-foreground">
            Z.ai Scaffold — socle de développement Next.js
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Badge variant="outline" className="text-muted-foreground">
            v0.2.1
          </Badge>
          <p className="text-sm text-muted-foreground">
            © {year} Z.ai — développement assisté par IA
          </p>
        </div>
      </div>
    </footer>
  );
}
