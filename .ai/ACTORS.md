# ACTEURS DU SYSTÈME & MATRICE DES PERMISSIONS

> Établi le 2026-10-30 à l'issue de AUDIT-001. **À mettre à jour à chaque évolution du modèle d'authentification (R-002).**

## 1. État des lieux

Le projet est un scaffold vierge : **aucun acteur métier n'est encore défini**, aucune authentification configurée (next-auth v4 présent mais inactif). Le schéma Prisma actuel (`User`/`Post`) ne porte aucun rôle.

## 2. Acteur actif actuel

### VISITEUR (Guest — non authentifié)
| Dimension | Valeur |
|---|---|
| Permissions | Consulter la page d'accueil `/` ; appeler les endpoints publics (`GET /api`) |
| Restrictions | Aucun accès en écriture ; aucune donnée personnelle ; aucune feature métier |
| Workflows | Parcours unique : arrivée → lecture (hero, stack, statut) |
| Interfaces dédiées | Page publique (composants `shared/` + `guest/`) |
| Données accessibles | Aucune (pas de scope DB) |

## 3. Matrice des permissions (acteur × action × ressource)

| Action \ Acteur | VISITEUR |
|---|---|
| Voir page d'accueil | ✅ |
| Lire statut projet (ancre `#statut`) | ✅ |
| `GET /api` (public) | ✅ |
| Écrire en base | ❌ |
| Authentification | ❌ (à définir — R-002) |

## 4. Acteurs candidats (à confirmer au cahier des charges)

Aucun acteur ne doit être inventé sans spécification. Points d'attention pour le futur cahier des charges :
- Le modèle d'authentification (next-auth v4 présent : credentials/OAuth/provider custom ?)
- Les rôles (ex. ADMIN / USER / …) et leur stockage (champ `role` sur User ? table dédiée ?)
- Les permissions par ressource et leur enforcement **côté API** (jamais côté UI seul)
- Les interfaces dédiées par acteur (structure `src/components/<acteur>/` déjà amorcée avec `guest/`)

## 5. Composants partagés vs spécifiques

| Catégorie | Emplacement | Contenu actuel |
|---|---|---|
| Shared (tous acteurs) | `src/components/shared/layout/` | `Header.tsx`, `Footer.tsx` |
| Shared (tous acteurs) | `src/components/ui/` | Bibliothèque shadcn/ui complète |
| Guest | `src/components/guest/` | Vide (prêt à recevoir) |
| Autres acteurs | — | À créer à la première feature |
