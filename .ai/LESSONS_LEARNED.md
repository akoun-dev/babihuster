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

### LL-005 — Double avance de jour dans le moteur de jeu (2026-10-30)
- **Contexte :** FEAT-001 — la branche `dormir` de `applyAction()` avançait le jour PUIS `closeDaySummary()` avançait encore (J1→J3) et écrasait `dayStats`.
- **Leçon :** quand deux fonctions du moteur partagent une responsabilité (fin de journée), une seule doit la porter. La détection a été faite par le sous-agent frontend (bug visible en E2E) — la revue croisée paie.
- **Action systémique :** correctif moteur (dormir ne pose que `pendingSummary`) + règle ajoutée à la checklist REVIEWER : « toute transition d'état ne doit avoir qu'un seul propriétaire ».

### LL-006 — La QA doit jouer AU PERSONNAGE, pas au script (2026-10-30)
- **Contexte :** pendant l'E2E, le script de test payait systématiquement les dash de police → 0 F et diagnostic « bug » erroné ; le journal du jeu a prouvé que le moteur était correct.
- **Leçon :** en cas de suspicion de bug, lire l'état sérialisé (localStorage) et le journal in-game AVANT de conclure ; distinguer difficulté de jeu et défaut technique.
- **Action systémique :** diagnostic par `localStorage` + journal = première étape de toute investigation gameplay.
