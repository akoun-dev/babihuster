import Link from "next/link";
import {
  ArrowDown,
  Atom,
  Check,
  Clock3,
  Component,
  Database,
  FileCode2,
  Triangle,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Page d'accueil — acteur : visiteur anonyme (Guest) + shared.
 *
 * Server component statique (aucune API call) structurée en trois sections :
 * 1. Hero — titre, sous-titre et description du scaffold.
 * 2. Stack technique — cards shadcn listant les technologies fournies.
 * 3. État du projet — badges de statut des axes (neutres/positifs, pas de rouge).
 *
 * Design : palette neutral du thème shadcn uniquement (aucun bleu/indigo),
 * responsive mobile-first, HTML sémantique, focus visible, cibles >= 44px.
 *
 * @module app/page
 */

type StackItem = {
  name: string;
  description: string;
  icon: LucideIcon;
};

const STACK: readonly StackItem[] = [
  {
    name: "Next.js 16",
    description:
      "Framework React full-stack : App Router, rendu serveur et routage par fichiers.",
    icon: Triangle,
  },
  {
    name: "React 19",
    description:
      "Bibliothèque UI avec Server Components, Actions et Suspense.",
    icon: Atom,
  },
  {
    name: "TypeScript 5",
    description:
      "Typage strict de bout en bout pour un code fiable et refactorable.",
    icon: FileCode2,
  },
  {
    name: "Prisma 6 + SQLite",
    description:
      "ORM typé et base de données embarquée, prêts pour la persistance.",
    icon: Database,
  },
  {
    name: "Tailwind CSS 4",
    description:
      "Utilitaires CSS pilotés par le thème (variables design tokens).",
    icon: Wind,
  },
  {
    name: "shadcn/ui",
    description:
      "Composants accessibles et personnalisables, style new-york.",
    icon: Component,
  },
] as const;

type StatusItem = {
  label: string;
  detail: string;
  ready: boolean;
  state: string;
};

const PROJECT_STATUS: readonly StatusItem[] = [
  {
    label: "Architecture",
    detail: "Layout racine et séparation des composants par acteurs en place.",
    ready: true,
    state: "En place",
  },
  {
    label: "Authentification",
    detail: "Aucun fournisseur configuré pour le moment.",
    ready: false,
    state: "Non configurée",
  },
  {
    label: "Fonctionnalités",
    detail: "En attente de backlog — aucune logique métier implémentée.",
    ready: false,
    state: "À venir",
  },
  {
    label: "Documentation",
    detail: "Conventions de dossiers et composants documentés (TSDoc).",
    ready: true,
    state: "En place",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* ——— Hero ——— */}
      <section aria-labelledby="hero-title">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
          <img
            src="/logo.svg"
            alt=""
            width={80}
            height={80}
            className="mx-auto size-16 sm:size-20"
          />
          <h1
            id="hero-title"
            className="mt-8 text-balance text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Z.ai Code Scaffold
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Un socle professionnel, normalisé et prêt à accueillir vos futures
            fonctionnalités.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
            Structure de dossiers par acteurs, composants shadcn/ui, données
            Prisma et exigences de qualité : accessibilité, responsive et
            TypeScript strict.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-11">
              <Link href="#stack">
                Découvrir la stack
                <ArrowDown aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11">
              <Link href="#statut">État du projet</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ——— Stack technique ——— */}
      <section id="stack" aria-labelledby="stack-title" className="scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Stack technique
            </h2>
            <p className="mt-2 text-muted-foreground">
              Les technologies fournies d&apos;origine par le scaffold, sans
              configuration supplémentaire.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STACK.map(({ name, description, icon: Icon }) => (
              <li key={name}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <span
                      aria-hidden="true"
                      className="mb-1 flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
                    >
                      <Icon className="size-5" />
                    </span>
                    <CardTitle className="text-base">{name}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— État du projet ——— */}
      <section
        id="statut"
        aria-labelledby="statut-title"
        className="scroll-mt-20"
      >
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              État du projet
            </h2>
            <p className="mt-2 text-muted-foreground">
              Suivi des axes du socle, mis à jour à mesure que le projet
              avance.
            </p>
          </div>
          <Card className="mt-8">
            <ul className="flex flex-col divide-y divide-border">
              {PROJECT_STATUS.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                  <Badge
                    variant={item.ready ? "default" : "outline"}
                    className={item.ready ? undefined : "text-muted-foreground"}
                  >
                    {item.ready ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <Clock3 aria-hidden="true" />
                    )}
                    {item.state}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </>
  );
}
