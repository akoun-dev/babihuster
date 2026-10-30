# LESSONS LEARNED — JOURNAL D'APPRENTISSAGE DU SYSTÈME

> Règle GOVERNANCE §2.4 : toute erreur constatée est journalisée, jamais masquée. Format : Contexte → Erreur/Leçon → Action systémique.

## 2026-10-30 — Session d'initialisation

### LL-001 — Image SVG et optimiseur Next.js
- **Contexte :** affichage du logo `/logo.svg` dans le layout.
- **Leçon :** `next/image` route les SVG via l'optimiseur qui peut renvoyer 400 sans `dangerouslyAllowSVG` ; `<img>` reste acceptable pour les SVG décoratifs (règle ESLint `@next/next/no-img-element` déjà désactivée dans le projet).
- **Action systémique :** pour tout asset SVG, utiliser `<img>` décoratif (`alt=""`) et le documenter ; réévaluer si des images bitmap sont introduites.

### LL-002 — Version en dur multi-emplacements
- **Contexte :** badge `v0.2.1` dupliqué dans Header et Footer.
- **Leçon :** toute donnée dupliquée dans ≥ 2 composants doit être centralisée (constante ou source unique) dès qu'elle évolue.
- **Action systémique :** dette D-002 tracée ; centralisation obligatoire à la première évolution de version.

### LL-003 — Année du copyright et prerender statique
- **Contexte :** `new Date().getFullYear()` dans le Footer d'une page pré-rendue statique.
- **Leçon :** une valeur dynamique dans un server component statique est figée au build — sans impact immédiat, mais à surveiller si l'exigence change.
- **Action systémique :** si précision requise, extraire l'année dans un composant client léger ou accepter le figeage documenté.

### LL-004 — Ancres vs futures routes
- **Contexte :** navigation du header pointant vers `/#stack`, `/#statut`.
- **Leçon :** les ancres sont acceptables en scaffold, mais chaque évolution structurelle de l'app doit revoir la navigation avant d'ajouter des routes.
- **Action systémique :** point de contrôle ajouté à la checklist REVIEWER.

## Modèle d'entrée

```
### LL-XXX — <titre court>
- Contexte : ...
- Leçon : ...
- Action systémique : (règle/checklist/documentation mise à jour)
```
