# FEATURE-004 — Personnage AAA (T-024)

> Demande utilisateur : « Je veux que ce soit comme vie2babi.ci mais en mieux, je veux une
> meilleur personnage » + master prompt « ABIDJAN HUSTLE CHARACTER DESIGN » (art director AAA)
> + 3 références visuelles (feuille d'expressions 3D, render personnage bomber/chaîne/sacoche,
> planche turnaround).

## 1. Objectif

Passer l'avatar d'un buste vectoriel flat (T-023) à un **personnage semi-réaliste pleine
silhouette**, reconnaissable, expressif et évolutif — conforme au master prompt :

| Exigence master prompt | Traduction web |
|---|---|
| §2 Semi-réaliste, silhouette identifiable | SVG pleine silhouette (ratio ~8 têtes), gradients de matière (peau, jean, cuir, tissu), ombres dirigées |
| §3 Visage avec personnalité | Visage détaillé : yeux avec reflets, sourcils expressifs, nez, bouche — 5 **expressions** |
| §4 Tenue qui évolue avec la progression | 4 paliers : `debutant` → `streetwear` → `bomber` → `costard` |
| §4 Sacoche, montre, accessoires | Sacoche bandoulière usée (débutant), chaîne + montre + écouteur (bomber) |
| §6.6 Expressions neutre/heureux/surpris/déterminé/contrarié | Prop `mood` — pilotée par le **moral** dans le HUD, prévisualisable à la création |
| §8 Éviter les clichés / costume traditionnel caricatural | Suppression du tenue « pagne wax » de départ (remplacée par « Modeste ») |
| Rendu studio (§7) | Planche concept art IA (2 visuels) affichée à la création (« Art conceptuel ») |

## 2. Contrats (source de vérité : `types.ts`)

- `Outfit = "debutant" | "streetwear" | "bomber" | "costard"` (**breaking** : `pagne` supprimé)
- `BeardId = "aucune" | "moustache" | "bouc" | "barbe"` (nouveau — le « etc... » utilisateur)
- `MoodId = "neutre" | "heureux" | "determine" | "surpris" | "contrarie"` (nouveau)
- `GameState` : `version: 1|2|3`, `beard?` ajouté (v3)

## 3. Migrations

- `withLookDefaults` (engine) : idempotent, v1/v2 → v3 —
  `pagne → debutant`, `beard ?? "aucune"`, `hair/skin` par défaut (T-023).
- Store persist : `version: 3`, migrate via `withLookDefaults`.
- Cloud `loadCloud` : accepte 1/2/3 ; `POST /api/game/save` : zod étendu (outfits v3 +
  héritage `pagne`, `hair/skin/beard` optionnels — corrige au passage la perte de
  `hair/skin` lors du round-trip cloud, bug lat T-023 détecté en revue).

## 4. Avatar v2 (`components/guest/Avatar.tsx`, réécriture)

- viewBox `0 0 240 460` ; cadrage `"full"` (silhouette, création) ou `"portrait"`
  (tête/épaules, HUD `size-11`).
- Gradients déterministes par props (`pg-skin-${skin}`, `pg-cloth-${outfit}`, jean/or/tee
  fixes) — pas de `useId`, ids partagés sûrs car fonction des seules props.
- Couches : cheveux arrière (dreads/afro) → jambes/chaussures → torse → bras/mains →
  sacoche → cou/tête → visage (expression + barbe) → cheveux avant → accessoires avant.
- 6 coiffures conservées (rase/coupe/dégradé/dreads/tresses/afro), 4 barbes, 5 expressions.

## 5. Écrans

- `CharacterCreation` : preview grande silhouette + 5 chips d'expression (test d'humeur) ;
  sections Nom / Coiffure / **Barbe** / Peau / Tenue (4 paliers) ; carte « Art conceptuel »
  (planches IA `/images/character/*`) ; `newGame(name, outfit, hair, skin, beard)`.
- `GameHUD` : Avatar `framing="portrait"` + barbe + humeur liée au moral
  (≥75 `heureux`, ≤30 `contrarié`, sinon `neutre`).

## 6. Tests (anti-menterie)

`bun run lint` 0 erreur → audit agent-browser : création (coiffure/barbe/peau/tenue/
expression réactives), lancement partie, HUD portrait avec humeur, desktop 1280 + mobile
390 (0 overflow), 0 erreur console. Screenshots archivés `.ai/screenshots/t-024-*`.
