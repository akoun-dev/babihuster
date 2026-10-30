# ADR-002 — Séparation des composants frontend par acteurs

- **Statut :** ✅ Accepté
- **Date :** 2026-10-30
- **Décideurs :** AGENT 1 (Tech Lead), validé par AGENT 2 (QA/PO)
- **Contexte :** la gouvernance impose une séparation des composants par acteurs (rôles utilisateurs). Le projet n'a aujourd'hui qu'un acteur (VISITEUR/Guest) et aucune authentification (R-002). Il faut amorcer la convention sans sur-concevoir.

## Décision
1. Arborescence cible adoptée immédiatement :
   - `src/components/shared/` (`ui/`, `layout/`, `common/`) — composants multi-acteurs, agnostiques, sans logique de rôle ;
   - `src/components/<acteur>/` — un dossier par acteur ; `guest/` créé dès l'initialisation ;
   - même logique pour `hooks/`, `services/`, `types/` quand ils apparaîtront.
2. Règles d'import : interdiction de cross-import entre acteurs ; interdiction de condition de rôle dans `shared/` ; composant partagé = configuré par props, jamais par rôle.
3. Un composant devient partagé seulement quand ≥ 2 acteurs l'utilisent de la même façon (sinon : props de configuration, ou composants distincts).
4. Les composants shadcn `src/components/ui/` font office de `shared/ui` (bibliothèque générique) — pas de duplication.
5. Toute exception est documentée ici ou dans ARCHITECTURE.md avec validation AGENT 1.

## Alternatives écartées
- Composant unique multi-acteurs avec branchement sur le rôle : rejeté (fourre-tout, risque de fuite de données, maintenance dégradée).
- Attendre la définition des acteurs pour structurer : rejeté (dette de restructuration plus coûteuse ensuite).

## Conséquences
- Contrôle systématique de la séparation par AGENT REVIEWER (checklist) et AUDIT GLOBAL (périodique).
- La matrice acteurs/permissions (`.ai/ACTORS.md`) est l'arbitre en cas de doute sur le rangement d'un composant.
