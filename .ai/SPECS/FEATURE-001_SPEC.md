# FEATURE-001_SPEC — Spécification fonctionnelle (Phase 1)

> AGENT 2 (QA/PO) — 2026-10-30. Approuvé par AGENT 1. Base : cahier des charges utilisateur + GDD + FEATURE-001_UX.

## 1. Vision du slice
Prototype jouable web de *Abidjan Hustle*, quartier unique **Yopougon**, boucle « vie quotidienne (Sims) + Système D + missions (GTA-lite) », **100 % ivoirien** : nouchi, FCFA, maquis, tontine, dash, transports, coupures CIE.

**Hors scope explicite (roadmap)** : 3D/temps réel, audio, autres quartiers, voies illégales étendues, M7 véhicules conduits, M9 business, M10 cloud multi-comptes (cloud simple 1 slot inclus).

## 2. Acteurs & permissions (hérite ACTORS.md)

| Acteur | Peut | Ne peut pas |
|---|---|---|
| JOUEUR (Guest) | créer 1 perso ; jouer ; sauvegarder local (auto+manuel) ; sauvegarder cloud via deviceId anonyme ; consulter glossaire/missions/comment jouer | authentification ; multiple slots cloud ; modifier les données d'équilibrage |

## 3. Exigences fonctionnelles (référencées GDD)

| ID | Exigence | Priorité GDD | Slice |
|---|---|---|---|
| F-01 | Création de perso : nom (1-20 car.), tenue de départ (3 silhouettes pagne/streetwear/costard) | M1.6 | ✅ simplifiée (couleur de tenue) |
| F-02 | HUD : jour, heure (cycle jour/nuit visuel), FCFA, 4 jauges (faim, énergie, moral, hygiène), réputation | M1.4/M8 | ✅ |
| F-03 | Carte Yopougon 6 zones interactives + déplacements 3 modes (à pied / Gbaka 100F / Jakarta 300F) avec trade-offs temps/argent/risque | M4.1/M7.4 | ✅ |
| F-04 | Actions contextuelles par zone (manger, travailler, danser, parler, doucher, acheter…) avec coûts temps/argent/effets jauges | M5/M8 | ✅ (18+ actions) |
| F-05 | Économie FCFA : prix réalistes, historique journal, plafond/borne 0..9 999 999 F | M5.1/M5.2 | ✅ |
| F-06 | Négociation simplifiée au marché (check Tchatche niveau → réduction 10-30 %) | M5.3 | ✅ |
| F-07 | Tontine : adhésion 2 000 F, cotisation par jour visité, payout 10 000 F à J+7 | M5.4 | ✅ |
| F-08 | Compétences Nouchi : Tchatche, Système D, Endurance, Réseau (XP à l'usage, niveau 1-5, effets bornés) | GDD §3 | ✅ |
| F-09 | Événements aléatoires pondérés : coupure CIE, pluie, microbes (terrain, nuit), contrôle police → **dash (choix payer/négocier)**, vendeur ambulant, bonne action Maman du quartier | GDD §3/§4 | ✅ (6 événements) |
| F-10 | Missions : M1 « L'arrivée au pays » (tuto), M2 « La livraison de la honte » (chrono 6h de jeu, pluie possible), M3 « L'enjaillement » (tenue + hygiène + soirée) — étapes, récompenses, échec possible pour M2 | GDD §5 | ✅ |
| F-11 | Dialogues PNJ nouchi avec glossaire contextuel (surlignage + définition), 6 PNJ nommés avec rôles du GDD | M2.1/M2.2/M2.5 | ✅ (dialogues scriptés) |
| F-12 | Cycle temps : action = coût en minutes ; après 02:00 → écroulement forcé (pénalité) ; dormir → J+1 06:00 + résumé du jour | M8.4 | ✅ |
| F-13 | Sécurité sociale : si faim ≤ 15 et argent < 200 → Tantie Rose offre l'attiéké (aucun blocage mortel) | Esprit GDD | ✅ |
| F-14 | Sauvegarde : localStorage auto (chaque J+1 + chaque action) + cloud anonyme (deviceId) via API ; « Continuer » reprend l'état exact | M1.5 | ✅ |
| F-15 | Glossaire nouchi consultable (12+ entrées) | M2.5 | ✅ |
| F-16 | Journal d'activité horodaté (in-game) | M3.4 | ✅ |
| F-17 | Réputation 0-100 : gagnée via missions/bonnes actions ; débloque répliques PNJ | GDD réputation | ✅ simplifié |

## 4. Critères d'acceptation (mesurables)

1. Une partie complète tuto (M1) est finissable en ≤ 15 minutes réelles sans lire la doc externe.
2. Chaque action affiche AVANT validation : coût FCFA, temps, effets prévisibles sur jauges.
3. Aucun état bloquant : solution toujours disponible (cf. F-13, jobs gratuits d'énergie négative interdits).
4. Sauvegarde cloud perdue/faille réseau → partie locale intacte.
5. Tous les dialogues contiennent ≥ 2 expressions nouchi/FI ; mots inconnus tous dans le glossaire.
6. Jauges bornées 0-100 ; argent borné ≥ 0 ; temps borné [06:00 ; 02:00+1].
7. Événements : probabilités documentées dans les données ; ≤ 1 événement par action.
8. Lighthouse a11y non régressé ; navigation clavier complète.
9. Footer sticky socle toujours conforme (min-h-screen flex flex-col + mt-auto).
10. `bun run lint` et `tsc --noEmit` 0 erreur.

## 5. Données métier (source de vérité : src/lib/game/data.ts, équilibrage documenté)

- Prix : garba 1 000 F, attiéké-poisson 1 500 F, eau 100 F, jus bissap 500 F, matelas 3 000 F, tenue soirée 2 500 F, provisions 1 200 F, Gbaka 100 F, Jakarta 300 F, dash 1 000-5 000 F.
- Jobs : vendeur d'eau 2 000 F/3 h, porteur marché 5 000 F/4 h, manœuvre chantier 4 000 F/5 h (XP variés).
- Tontine : cotisation 2 000 F/jour visité (marché), payout 10 000 F J+7 (flag protection anti-perdite : si raté, report).
- XP : usage normal +2, réussite mission +10 ; paliers niveau : [0,10,25,45,70].
- Événements (par action hors chambre, pondérations) : pluie 12 % (si extérieur), ambulant 10 %, police 8 % (carrefour/gare 15 %), microbes 15 % (terrain), CIE 20 % (chambre, soirée), coup de main 8 %.

## 6. Tests de recette (QA — à exécuter par acteur)

**JOUEUR — parcours complet**
1. Menu → Nouvelle partie → création (nom « Zézé », tenue pagne) → intro Momoh (« On a mis le pays ! ») → J1 06:00, 2 000 F.
2. Gare→parler Momoh → mission M1 offerte → accepter.
3. Carrefour → job vendeur d'eau ×2 (événements possibles) → Marché → acheter matelas (3 000 F).
4. Chambre → dormir → résumé J1 → J2 ; M1 étape validée → terminer → +300 F +5 rep.
5. Maquis → parler Tantie → M2 offerte → activer → livrer (marché → carrefour) en ≤ 6 h → succès 3 000 F +10 rep. (Test échec : traîner 7 h → échec, réputation -3.)
6. Marché → adhérer tontine → cotiser → vérifier compteur J+7.
7. Terrain vague la nuit → event microbes → choisir « Négocier » (tchatche) → selon niveau : esquive ou perte.
8. Carrefour → event police → « Payer le dash » vs « Tchatche » → vérifier montants.
9. Menu pause → Sauvegarder cloud → recharger la page → Continuer → état exact restauré.
10. Glossaire : cliquer un mot surligné → définition.
11. Minuit : rester actif jusqu'à 02:30 → écroulement forcé → J+1 avec pénalité.
12. Mobile 390px : parcours 1-4 rejoué sans débordement.

## 7. Risques
| Risque | Mitigation |
|---|---|
| Dérive scope (GDD 54 US) | Slice figé F-01→F-17 ; tout le reste → roadmap `.ai/` |
| Save corrompue | version de schéma + try/catch parse + fallback menu |
| Nouchi approximatif | glossaire + relecture OWNER ; ton humoristique assumé |
| Difficulté d'équilibrage | constantes centralisées data.ts + sécurité F-13 |
