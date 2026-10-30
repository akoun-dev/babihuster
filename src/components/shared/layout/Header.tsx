import Link from "next/link";
import { Badge } from "@/components/ui/badge";

/**
 * Header partagé — acteur : shared (tous acteurs).
 *
 * En-tête global affiché sur toutes les pages :
 * - Logo Z.ai + titre du projet + badge de version.
 * - Navigation accessible (`nav[aria-label]`) vers les sections de l'accueil.
 *
 * Comportement :
 * - Sticky en haut de viewport (le footer est géré par `Footer`).
 * - Liens tactiles >= 44px (`min-h-11`) et focus visible (ring shadcn).
 *
 * @module shared/layout/Header
 */
const NAV_LINKS = [
  { href: "/", label: "Accueil", short: "Accueil" },
  { href: "/#stack", label: "Stack", short: "Stack" },
  { href: "/#statut", label: "État du projet", short: "État" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Z.ai Scaffold — retour à l'accueil"
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
          {/* Logo décoratif : le nom du projet est porté par le texte adjacent.
              Texte masqué < 400px pour garantir zéro débordement horizontal
              (le lien conserve son aria-label complet). */}
          <span className="hidden min-[400px]:inline font-semibold tracking-tight">Z.ai Scaffold</span>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            v0.2.1
          </Badge>
        </Link>

        <nav aria-label="Navigation principale">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:px-3"
                >
                  {/* Label court en mobile pour éviter tout débordement (< sm). */}
                  <span className="sm:hidden">{link.short}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
