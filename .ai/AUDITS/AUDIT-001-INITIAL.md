# AUDIT-001 — AUDIT INITIAL GLOBAL DU PROJET

- **Date :** 2026-10-30 · **Auditeurs :** AGENT AUDIT GLOBAL + AGENT 1 · **Statut :** ✅ Clôturé
- **Périmètre :** intégralité du repo, config, dépendances, git, runtime, sécurité.

## 1. Identification

| Élément | Valeur |
|---|---|
| Projet | `nextjs_tailwind_shadcn_ts` v0.2.1 (scaffold Z.ai) |
| Nature | Scaffold vierge — **aucune fonctionnalité métier** |
| Serveur dev | `bun run dev` port 3000 — opérationnel (`GET / 200`) |
| Git | 1 commit initial ; scaffold largement untracked |

## 2. Constats détaillés

### Structure
- `src/app/` : `page.tsx` (logo centré, styles inline), `layout.tsx` (fonts Geist + Toaster), `globals.css` (thème), `api/route.ts` (`GET` → "Hello, world!").
- `src/components/ui/` : ~47 composants shadcn/ui complets.
- `src/lib/` : `db.ts` (Prisma singleton + log query), `utils.ts` (`cn`).
- `prisma/schema.prisma` : modèles scaffold `User`/`Post` (aucun rôle, aucune relation métier).
- `examples/websocket/` : démo socket.io (référence) ; `mini-services/` vide ; `tests/` : scripts shell d'infra uniquement.
- Documentation : **aucun README racine**, aucune spec.

### Configuration
- `next.config.ts` : `output: standalone`, `typescript.ignoreBuildErrors: true` ⚠️, `reactStrictMode: false`.
- `.env` : `DATABASE_URL=file:/home/z/my-project/db/custom.db` — non versionné ✅.
- `Caddyfile` : gateway `:81` → `:3000` + réécriture `XTransformPort` ✅.
- ESLint config Next présente ; lint exécutable via `bun run lint`.

### Sécurité (DEV SÉCURITÉ — première passe)
| Point | Constat | Gravité |
|---|---|---|
| Secrets | `.env` minime (DATABASE_URL local), non tracké git | 🟢 OK |
| Surface d'attaque | API "Hello World" sans effet de bord, pas de DB write | 🟢 Faible |
| TS au build | `ignoreBuildErrors: true` → erreurs TypeScript masquées | 🟠 Moyen (R-001) |
| Auth | next-auth installé non configuré — aucune session active | 🟡 À trancher (R-002) |
| Dépendances | Versions récentes, aucune vulnérabilité évidente connue à cette passe | 🟢 OK |

### Accessibilité / UX (état avant normalisation)
- Pas de header/footer, pas de skip-link, HTML non sémantique (divs), styles inline.
- → **Corrigé par T-004** (layout sémantique, skip-link, focus visible, cibles 44px, footer sticky).

### Performance
- Page statique pré-rendue (`○`), pas de client component inutile après T-004.
- Aucune optimisation requise à ce stade (aucune donnée, aucun bundle métier).

## 3. Dette & risques (registre complet : feuille « Dette & Risques » de TASKS.xlsx)

| ID | Résumé | Statut |
|---|---|---|
| R-001 | `ignoreBuildErrors=true` (qualité build) | Ouvert — compensé par `tsc --noEmit` |
| R-002 | Modèle d'auth/acteurs non tranché | Ouvert — décision produit requise |
| R-003 | Warning cross-origin dev (sandbox) | Accepté |
| D-001 | Schéma Prisma scaffold sans rôles | Ouvert — à refondre à la 1ʳᵉ feature |
| D-002 | Version en dur dans Header/Footer | Ouvert |

## 4. Décisions de l'audit

1. Instaurer la gouvernance `.ai/` (fait — T-003).
2. Lancer le sprint de normalisation P0 (fait — T-004).
3. **Ne pas inventer de feature** : blocage volontaire T-010 en attente du cahier des charges utilisateur (règle anti-supposition).
4. Prochain audit global (AUDIT-002) : après la première feature métier.

## 5. Conformité aux règles de gouvernance (auto-audit du système)

| Règle | Conformité |
|---|---|
| Analyse avant action | ✅ (ce rapport) |
| Séparation par acteur amorcée | ✅ (`shared/layout/`, `guest/`) |
| Footer sticky | ✅ T-004 (min-h-screen flex flex-col + mt-auto) |
| A11y socle | ✅ T-004 (skip-link, ARIA, focus) |
| Fichier central TASKS.xlsx | ✅ validé (0 défaut) |
| TeamStatus visible | ✅ `.ai/TEAM_STATUS.md` |
| Anti-menterie (preuves) | ✅ lint + validate + logs cités |
