# Z.ai Code Scaffold — Projet sous gouvernance multi-agents

Application Next.js 16 (App Router) + TypeScript 5 + React 19, prise en charge par un **système multi-agents autonome** de développement, normalisation, test et suivi de projet.

## 🚀 Démarrage

```bash
bun run dev        # serveur de développement (port 3000)
bun run lint       # ESLint
bun run db:push    # applique le schéma Prisma à la base SQLite
bun run db:generate# génère le client Prisma
```

> ⚠️ Environnement sandbox : serveur de dev uniquement sur le port 3000, requêtes API en chemins relatifs, services annexes derrière le gateway (`?XTransformPort=<port>`).

## 🧱 Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 — App Router |
| Langage | TypeScript 5 (strict) |
| UI | React 19, Tailwind CSS 4, shadcn/ui (new-york/neutral), Lucide |
| Données | Prisma 6 + SQLite (`db/custom.db`) — accès via `@/lib/db` |
| State | Zustand (client) · TanStack Query (serveur) |
| Validation | zod · react-hook-form |
| Auth | next-auth v4 (installé, **non configuré** — décision produit requise) |
| IA | z-ai-web-dev-sdk (**backend uniquement**) |
| Runtime | Bun · Gateway Caddy (un port externe) |

## 📁 Structure (séparation par acteurs — ADR-002)

```
src/
├── app/                  # Routes App Router + API routes
├── components/
│   ├── ui/               # shadcn/ui (génériques)
│   ├── shared/           # layout/ (Header, Footer) · common/ (à venir)
│   └── guest/            # Composants du VISITEUR (à venir)
├── hooks/                # Hooks partagés
└── lib/                  # db.ts (Prisma), utils.ts (cn)
```

Un dossier par acteur (`guest/`, puis tout futur rôle) ; `shared/` = agnostique, sans logique de rôle. Voir `.ai/ARCHITECTURE.md`.

## 🤖 Gouvernance multi-agents (dossier `.ai/`)

| Fichier | Rôle |
|---|---|
| `.ai/GOVERNANCE.md` | Règles du système (séquence obligatoire, intégrité, couches, acteurs) |
| `.ai/TEAM_ARCHITECTURE.md` | Équipe virtuelle, RACI, modalités d'exécution |
| `.ai/ARCHITECTURE.md` | Architecture technique et conventions de code |
| `.ai/ACTORS.md` | Acteurs du système et matrice des permissions |
| `.ai/TASKS.xlsx` | **Fichier central de suivi** (tâches, features, équipe, audits, dette, journal) |
| `.ai/TEAM_STATUS.md` | État temps réel de l'équipe et des épopées |
| `.ai/SPECS/` | Spécifications des features (phases 0→8) |
| `.ai/ADR/` | Architecture Decision Records |
| `.ai/AUDITS/` | Rapports d'audit global |
| `.ai/LESSONS_LEARNED.md` | Journal d'apprentissage |
| `.ai/HANDOFFS/` | Transferts entre agents |

**Règle clé :** aucune fonctionnalité métier n'est implémentée sans spécification validée (Phase 0 UX → Phase 1 Spec → … → Phase 8 Audit). L'état courant du projet est documenté dans `.ai/AUDITS/AUDIT-001-INITIAL.md`.

## 🧭 État du projet (2026-10-30)

- ✅ Gouvernance et pilotage en place
- ✅ Normalisation P0 : layout sémantique, header, footer sticky, accessibilité socle
- 🔜 Authentification et rôles : en attente de décision produit
- ⛔ Fonctionnalités métier : en attente du cahier des charges
