# Abidjan Hustle — Le Rêve Ivoirien 🇨🇮

**Vertical Slice Web jouable** d'un jeu de vie 100 % ivoirien (Next.js 16), sous gouvernance multi-agents. Quartier unique : **Yopougon** — djossi, garba, tontine, dash, enjaillement, microbes… On a mis le pays !

> Jouable sur la route `/` : crée ton môgô, gère tes jauges (faim, énergie, moral, hygiène), gagne des FCFA, négocie le nouchi, survis aux coupures CIE et aux contrôles de police, et enchaîne les missions (M1 « L'arrivée au pays » → M3 « L'enjaillement du siècle »).

## 🎮 Le jeu

| Système | Description |
|---|---|
| Moteur pur | `src/lib/game/engine.ts` (fonctions pures, invariants garantis, testable) |
| Données | `src/lib/game/data.ts` — zones, actions, PNJ, missions, glossaire nouchi (équilibrage documenté) |
| État | `src/lib/game/store.ts` — Zustand + `persist` localStorage (auto-save à chaque jour) |
| Cloud save | 1 slot anonyme par appareil (`SaveGame` Prisma + `POST /api/game/save`, `GET /api/game/load`) |
| UI | `src/components/guest/**` (acteur JOUEUR) — HUD, carte, actions, dialogues, événements, missions |
| Palette | Tokens `--game-*` (Noir Maquis, Terre Rouge, Soleil Ivoire, tricolore ivoirien…) — normative, issue du GDD |

Spécifications complètes : `.ai/SPECS/FEATURE-001_UX.md` · `_SPEC.md` · `_TECH.md` · décision d'architecture : `.ai/ADR/ADR-003-vertical-slice-web.md`.

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
- ✅ **FEAT-001 — Abidjan Hustle Vertical Slice : boucle de jeu complète, validée E2E**
- 🔜 Authentification et multi-slots : en attente de décision produit (R-002)
- 🔜 Roadmap jeu : audio, autres quartiers (Plateau, Adjamé), conduite, business (GDD §S4-S8)
