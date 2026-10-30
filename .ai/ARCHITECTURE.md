# ARCHITECTURE TECHNIQUE DU PROJET

> Établie par AGENT 1 (Tech Lead) — 2026-10-30. Source de vérité : les fichiers réellement présents.

## 1. Stack constatée (NON négociable, déduite du repo)

| Couche | Technologie | Version |
|---|---|---|
| Framework | Next.js **App Router** | 16.x |
| Langage | TypeScript (strict) | 5.x |
| Runtime UI | React | 19.x |
| Style | Tailwind CSS + tw-animate-css | 4.x |
| Composants | shadcn/ui (style *new-york*, base *neutral*, icônes Lucide) | — |
| DB | SQLite (`db/custom.db`) via Prisma Client singleton `@/lib/db` | Prisma 6.x |
| State client | Zustand (prévu) + TanStack Query (prévu) | 5.x |
| Formulaires | react-hook-form + zod (prévus) | — |
| Auth | next-auth v4 — **installé, NON configuré** (R-002) | 4.24 |
| IA / SDK | z-ai-web-dev-sdk — **backend uniquement** | 0.0.18 |
| Runtime | Bun (`bun run dev` port 3000, jamais `build` en dev) | 1.3.x |
| Gateway | Caddy `:81` → `:3000` ; services annexes via `?XTransformPort=<port>` | — |
| Real-time | socket.io — mini-service dédié (réf. `examples/websocket/`) | — |

## 2. Structure du projet (convention de séparation par acteurs)

```
src/
├── app/                        # Routes App Router (page unique utilisateur : /)
│   ├── layout.tsx              # min-h-screen flex flex-col + Header + Footer sticky (mt-auto)
│   ├── page.tsx                # Page d'accueil normalisée (server component)
│   ├── globals.css             # Thème Tailwind 4 + tokens shadcn + prefers-reduced-motion
│   └── api/                    # API routes (seul point d'entrée backend HTTP)
├── components/
│   ├── ui/                     # shadcn/ui (génériques — équivalent shared/ui)
│   ├── shared/
│   │   ├── layout/             # Header.tsx, Footer.tsx (tous acteurs)
│   │   └── common/             # Composants métier partagés (à venir)
│   ├── guest/                  # Composants spécifiques VISITEUR (à venir)
│   └── <acteur>/               # Un dossier par futur acteur (règle GOVERNANCE §6)
├── hooks/                      # use-toast, use-mobile (shared) — spécifiques par acteur à venir
├── lib/                        # db.ts (Prisma singleton), utils.ts (cn)
└── types/                      # Types partagés à créer
```

**Routes utilisateur visibles : uniquement `/`** (règle d'environnement). Toute navigation passe par des ancres ou par évolution de `src/app/page.tsx`.

## 3. Décisions structurantes (ADR)

| ADR | Décision | Statut |
|---|---|---|
| [ADR-001](ADR/ADR-001-stack-technique.md) | Maintien de la stack scaffold (Next 16 / TS 5 / Prisma-SQLite / Tailwind 4 / shadcn) | Accepté |
| [ADR-002](ADR/ADR-002-separation-par-acteurs.md) | Séparation des composants frontend par acteurs dès le premier code | Accepté |

## 4. Règles d'implémentation par couche

### Frontend
- Server components par défaut ; `'use client'` uniquement si état/effets nécessaires.
- Appels API : **jamais dans les composants** → hooks (`use*Query`) ou services (`src/lib/services/`).
- Fetch : chemins **relatifs** uniquement (`/api/...`, `/?XTransformPort=...` pour mini-services).
- Tous états visuels couverts : loading (Skeleton), error (Alert/Toast), empty (EmptyState), success (Toast).
- Cibles tactiles ≥ 44px, `focus-visible`, HTML sémantique, skip-link présent.
- Couleurs : tokens du thème uniquement — **pas de bleu/indigo décoratif**.

### Backend
- Logique métier dans des modules dédiés (`src/lib/services/` côté serveur), pas dans les route handlers.
- Validation d'entrée systématique (zod) avant toute écriture DB.
- Prisma : accès via `import { db } from '@/lib/db'` uniquement.
- z-ai-web-dev-sdk exclusivement côté serveur.

### Data
- Schéma dans `prisma/schema.prisma` ; déploiement par `bun run db:push`.
- Types Prisma primitifs (pas de list) ; relations explicites.

### Real-time (si requis)
- Mini-service socket.io dans `mini-services/<service>/` (bun, port dédié, `bun --hot`).
- Client : `io("/?XTransformPort=<port>")`, path `/` — jamais d'URL directe de port.

## 5. Contraintes d'environnement (sandbox)

- Un seul port externe → gateway Caddy ; pas d'URL absolue dans le code client.
- Dev server : `bun run dev` (background, port 3000) — journaux dans `dev.log`.
- Pas de `bun run build` en développement (réservé à la vérification statique ponctuelle).
- Aucune autre route que `/` visible par l'utilisateur final.
