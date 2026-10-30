# GOUVERNANCE — SYSTÈME MULTI-AGENTS AUTONOME

> Document de référence. Toute évolution de ces règles passe par un ADR et la validation de AGENT 1 + AGENT 2.

## 1. Principe fondamental (séquence obligatoire)

```
COMPRENDRE (acteurs inclus) > CONCEVOIR (UX/UI par acteur) > PLANIFIER (Tech Lead + ADR)
> DÉLÉGUER (équipe) > COMMIT > REVIEW (séparation par acteur incluse) > DOCUMENTER
> AUDITER (sécurité) > VALIDER (a11y + perf) > TESTER (QA par acteur)
> AUDITER GLOBALEMENT > APPRENDRE (Lessons Learned)
```

**Jamais :** modifier à l'aveugle · mentir sur l'avancement · commiter n'importe quoi · ignorer l'a11y · négliger la perf · livrer sans audit global · mélanger les composants par acteur.

## 2. Règle d'intégrité absolue (anti-menterie)

1. Tout statut avancé dans TASKS.xlsx doit être **prouvable** (fichier, log, capture, commande reproductible).
2. « Terminé » = code + lint + vérification E2E réalisées. Pas de déclaration sans preuve.
3. Un agent ne déclare JAMAIS seul une tâche terminée : validation croisée obligatoire (voir §5).
4. Toute erreur constatée est journalisée (Journal + LESSONS_LEARNED.md), jamais masquée.
5. Interdiction de supprimer/ignorer un test ou un contrôle pour faire « passer » une validation.
6. En cas de doute, le statut est rétrogradé et l'incertitude est documentée.

## 3. Règle absolue : analyse avant action

Aucun agent ne modifie le code avant d'avoir lu : `.ai/ARCHITECTURE.md`, `.ai/ACTORS.md`, `.ai/AUDITS/` (dernier audit), et la spécification de la feature concernée (`.ai/SPECS/`). La stack se déduit des fichiers réellement présents — JAMAIS supposée.

## 4. Cycle de vie d'une feature (phases 0→8)

| Phase | Contenu | Responsable | Artefact |
|---|---|---|---|
| 0 | Conception UX/UI (personas, flows par acteur, wireframes, états, a11y, responsive) | UX/UI Designer | `.ai/SPECS/FEATURE-XXX_UX.md` — **validation UX par AGENT 2 requise** |
| 1 | Capture & spécification (US, critères d'acceptation, acteurs + permissions) | AGENT 2 (QA/PO) | `.ai/SPECS/FEATURE-XXX_SPEC.md` |
| 2 | Design technique (contrats API, schéma DB, archi frontend par acteur) | AGENT 1 (Tech Lead) | `.ai/SPECS/FEATURE-XXX_TECH.md` + ADR si décision structurante |
| 3 | Découpage & planification (tâches atomiques, dépendances, parallélisme) | AGENT 1 + AGENT 2 | Entrées dans TASKS.xlsx |
| 4 | Implémentation parallèle (frontend d'abord, puis backend ; API-first) | Équipe opérationnelle | Code + commits conventionnels |
| 5 | Revue, intégration, tests (revue indépendante + E2E par acteur) | REVIEWER + QA | Rapports de revue / tests |
| 6 | Validation & documentation finale | AGENT 2 + DOC | Doc à jour + clôture TASKS.xlsx |
| 7 | Rétrospective & apprentissage | Tous | `LESSONS_LEARNED.md` |
| 8 | Audit global périodique | AUDIT GLOBAL | `.ai/AUDITS/AUDIT-XXX.md` |

## 5. Séparation des couches (opérations CRUD — obligatoire)

```
[UI / Composants PAR ACTEUR]
      ↓ hooks
[Hooks / State PAR ACTEUR]
      ↓ services
[Services / API clients PAR ACTEUR]
      ↓ fetch (chemin relatif uniquement)
[API routes Next.js]
      ↓ db (@/lib/db)
[Prisma / SQLite]
```

- Pas de requête DB dans les composants. Pas d'appel HTTP direct dans les composants.
- Pas de logique UI côté backend. Pas de cross-import entre acteurs.
- z-ai-web-dev-sdk : **backend uniquement** (jamais côté client).
- API : routes Next.js (`src/app/api/**`), chemins **relatifs** uniquement dans le fetch client. Services annexes = mini-services + `?XTransformPort=`.

## 6. Séparation par acteur (résumé opérationnel)

- Composants/hooks/services/types : `shared/` (multi-acteurs, agnostiques, zéro logique de rôle) vs `<acteur>/` (ex. `guest/`).
- **Interdits** : condition de rôle dans un composant partagé ; import d'un composant d'acteur par un autre ; composant « fourre-tout » multi-acteurs ; mélange de types d'acteurs dans un même fichier.
- Exception possible : documentée dans ARCHITECTURE.md + validée par AGENT 1.
- Contrôle systématique par AGENT REVIEWER (§checklist) et AGENT AUDIT GLOBAL (périodique).

## 7. Qualité & vérification

- `bun run lint` obligatoirement clean à chaque livraison.
- `bunx tsc --noEmit` sur les fichiers touchés (R-001 : `ignoreBuildErrors=true` en place).
- Vérification navigateur (Agent Browser) pour toute évolution visible.
- Footer sticky : `min-h-screen flex flex-col` + `mt-auto` — contrôle systématique.
- Aucun test automatisé n'est écrit sans demande explicite du produit.

## 8. Statuts & priorités (TASKS.xlsx)

- Statuts : `À faire` / `En cours` / `En revue` / `Terminé` / `Bloqué` (avec cause + déblocage).
- Priorités : `P0` (bloquant/sécurité/fondateur) > `P1` (normal) > `P2` (agréable).
- Tâche « Bloqué » ⇒ note de cause obligatoire + action de déblocage.

## 9. Commits (AGENT COMMIT)

- Convention : `feat:` / `fix:` / `docs:` / `refactor:` / `chore:` / `perf:` / `test:` / `a11y:` / `security:`.
- Commits atomiques, message explicite, pas de commit de fichiers temporaires, `.env` et `db/` jamais committés.
- Vérification pre-commit : lint + cohérence du scope.

## 10. Conflits & priorisation

1. Sécurité > 2. Intégrité des données > 3. Conformité aux règles de gouvernance > 4. Correctif de bug bloquant > 5. Feature > 6. Normalisation > 7. Perf > 8. Docs.
Un désaccord entre agents se résout par AGENT 1 (technique) ou AGENT 2 (produit) ; le désaccord persistant est journalisé et remonté au PRODUCT OWNER.

## 11. Règle d'arrêt

Le système s'arrête (rend la main à l'utilisateur) lorsque :
- une validation externe est requise (cahier des charges, décision produit) ;
- toutes les tâches P0/P1 sont `Terminé` et l'audit global est `Clôturé` ;
- un bloquant environnemental rend le progrès impossible.
