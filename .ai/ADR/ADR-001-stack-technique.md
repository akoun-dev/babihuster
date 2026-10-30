# ADR-001 — Maintien de la stack technique du scaffold

- **Statut :** ✅ Accepté
- **Date :** 2026-10-30
- **Décideurs :** AGENT 1 (Tech Lead), validé par AGENT 2 (QA/PO)
- **Contexte :** le projet est livré avec une stack déjà installée et verrouillée par l'environnement d'exécution (Bun, port 3000, gateway Caddy, SQLite). Aucun cahier des charges ne motive un changement.

## Décision
1. Conserver **Next.js 16 App Router + TypeScript 5 + React 19** comme socle.
2. Conserver **Prisma 6 + SQLite** (`db/custom.db`) pour la persistance ; accès exclusivement via `@/lib/db`.
3. Conserver **Tailwind CSS 4 + shadcn/ui (new-york/neutral)** comme design system ; interdiction d'introduire un second système de composants.
4. State : **Zustand** (client) + **TanStack Query** (serveur) lorsqu'un état global sera requis.
5. Validation : **zod** pour tout input (frontend et API).
6. IA : **z-ai-web-dev-sdk** backend uniquement.
7. Runtime de dev : **Bun**, dev server port 3000, pas de build en phase de développement.

## Alternatives écartées
- MySQL/PostgreSQL : indisponibles dans l'environnement (SQLite imposé) ; le schéma Prisma reste portable si l'environnement évolue.
- Autre UI kit (MUI, AntD) : redondant avec shadcn/ui complet déjà présent.

## Conséquences
- Toute demande de librairie hors stack est redirigée vers l'équivalent présent (règle d'environnement).
- Portabilité DB assurée par Prisma ; migrations via `db:push` en dev.
