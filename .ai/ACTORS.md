# ACTEURS DU SYSTÈME & MATRICE DES PERMISSIONS

> Établi le 2026-10-30 à l'issue de AUDIT-001 ; mis à jour à la réception du cahier des charges FEAT-001. **À mettre à jour à chaque évolution du modèle d'authentification (R-002).**

## 1. État des lieux

Projet **Abidjan Hustle — Vertical Slice Web (FEAT-001)** : pas d'authentification (next-auth v4 présent mais inactif — R-002). Deux acteurs actifs : VISITEUR (avant partie) et JOUEUR (en partie). ADMIN prévu en roadmap P2, non implémenté.

## 2. Acteur actif actuel

### VISITEUR (Guest — non authentifié)
| Dimension | Valeur |
|---|---|
| Permissions | Consulter la page d'accueil `/` ; appeler les endpoints publics (`GET /api`) |
| Restrictions | Aucun accès en écriture ; aucune donnée personnelle ; aucune feature métier |
| Workflows | Parcours unique : arrivée → lecture (hero, stack, statut) |
| Interfaces dédiées | Page publique (composants `shared/` + `guest/`) |
| Données accessibles | Aucune (pas de scope DB) |

## 3. Matrice des permissions héritée du socle (avant FEAT-001)

| Action \ Acteur | VISITEUR |
|---|---|
| `GET /api` (public) | ✅ |
| Authentification | ❌ (à définir — R-002) |

## 4. Acteurs du projet FEAT-001 (2026-10-30, cahier des charges reçu)

### JOUEUR (Guest — le joueur du jeu Abidjan Hustle)
| Dimension | Valeur |
|---|---|
| Permissions | Créer 1 personnage ; jouer (actions, déplacements, missions, tontine) ; sauvegarde locale auto/manuel ; sauvegarde cloud **anonyme** via deviceId (1 slot) ; consulter glossaire/missions/aide |
| Restrictions | Pas d'authentification ; pas de multi-slots cloud ; pas d'édition des données d'équilibrage |
| Workflows | Menu → création → boucle de jeu (carte→actions→événements→missions) → résumé jour → save |
| Interfaces dédiées | `src/components/guest/**` (GameShell, HUD, CityMap, ActionPanel, DialogueBox…) |
| Données accessibles | Son propre GameState (clé localStorage + deviceId cloud) — aucun accès aux données d'autrui |

### VISITEUR (avant partie)
- Voir le menu principal (pitch, mécaniques), accéder à « Comment jouer » et au glossaire.
- Interfaces : écran menu (shared layout + guest MainMenu).

### ADMIN (futur — hors slice)
- Équilibrage des données (data.ts), modération. Roadmap P2 — non implémenté.

## 5. Matrice des permissions (actuel, mise à jour FEAT-001)

| Action \ Acteur | VISITEUR | JOUEUR |
|---|---|---|
| Voir menu / pitch | ✅ | ✅ |
| Créer un personnage | ❌ | ✅ |
| Jouer (actions, missions, tontine) | ❌ | ✅ |
| Sauvegarde locale | ❌ | ✅ |
| Sauvegarde cloud (deviceId anonyme) | ❌ | ✅ |
| `GET /api/game/load` / `POST /api/game/save` | ❌ (sans deviceId de session) | ✅ (son deviceId) |
| Écrire en base autrement | ❌ | ❌ |

## 6. Composants partagés vs spécifiques

| Catégorie | Emplacement | Contenu actuel |
|---|---|---|
| Shared (tous acteurs) | `src/components/shared/layout/` | `Header.tsx`, `Footer.tsx` |
| Shared (tous acteurs) | `src/components/ui/` | Bibliothèque shadcn/ui complète |
| Guest (JOUEUR) | `src/components/guest/` | Écrans et composants du jeu Abidjan Hustle (FEAT-001) |
| Autres acteurs | — | À créer aux futures features |
