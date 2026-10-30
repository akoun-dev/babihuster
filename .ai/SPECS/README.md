# SPECS — Spécifications des fonctionnalités

Cycle de vie complet d'une feature (phases 0→8) — voir `.ai/GOVERNANCE.md` §4.

## Convention de nommage

| Fichier | Phase | Rédacteur | Validation |
|---|---|---|---|
| `FEATURE-XXX_UX.md` | 0 — Conception UX/UI | AGENT UX/UI DESIGNER | **AGENT 2 obligatoire avant Phase 1** |
| `FEATURE-XXX_SPEC.md` | 1 — Spécification | AGENT 2 (QA/PO) | AGENT 1 |
| `FEATURE-XXX_TECH.md` | 2 — Design technique | AGENT 1 (Tech Lead) | AGENT 1 + REVIEWER (contrats) |
| Découpage | 3 — Planification | AGENT 1 + AGENT 2 | Entrées dans `TASKS.xlsx` (feuille Features + Tâches) |

## Contenu minimal de FEATURE-XXX_UX.md (Phase 0)

- Personas & acteurs concernés (référence `.ai/ACTORS.md`)
- User flows **par acteur**
- Wireframes **par acteur** (ASCII autorisé)
- États : loading / error / empty / success / disabled
- Interactions (animations, feedback), accessibilité (clavier, ARIA, focus)
- Design system : composants existants réutilisés (référence `src/components/ui/`)
- Responsive : mobile / tablette / desktop
- Composants partagés vs spécifiques par acteur
- Validation UX : ☐ validé par AGENT 2 (date + signature)

## Règle

**Aucune feature métier n'est implémentée sans `FEATURE-XXX_UX.md` validé + `FEATURE-XXX_SPEC.md` approuvé.** En l'absence de cahier des charges utilisateur, aucune spécification n'est ouverte (FEAT-000 bloqué volontairement).
