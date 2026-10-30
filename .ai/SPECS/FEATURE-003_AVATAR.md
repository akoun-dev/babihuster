# FEATURE-003 — Avatar personnalisable (personnage, coiffure, peau)

> Demande utilisateur directe (T-023) : « il faut un personnage, Choisir sa
> coiffure etc... » — phrased verbatim, « etc. » ⇒ personnalisation au-delà
> de la coiffure (peau incluse).

## 1. Objectif

Donner un visage au joueur : avatar visible à la création (preview live) et
dans le HUD, avec choix de **coiffure** (6), **teinte de peau** (4) et la
**tenue** existante (3). Sérialisé dans la save (localStorage + cloud).

## 2. Acteur & user stories

Acteur : **JOUEUR (guest)**.

| # | User story | Critère d'acceptation |
|---|---|---|
| US-1 | Je vois mon personnage pendant la personnalisation | Preview `<Avatar/>` live dans l'écran Création |
| US-2 | Je choisis sa coiffure | 6 radio-cards (Coupe, Rasé, Dégradé, Dreads, Tresses, Afro) avec swatch couleur |
| US-3 | Je choisis sa teinte de peau | 4 pastilles radio (Noisette, Café, Chocolat, Ébène), cible tactile ≥ 44 px |
| US-4 | Mon look persiste | `GameState.v2` : `hair` + `skin` ; migration v1→v2 avec défauts sûrs (coupe/café) |
| US-5 | Mon personnage me suit en jeu | Mini-portrait dans le HUD (chip 44 px, hidden < sm) |

## 3. Design technique

- **Composant** `src/components/guest/Avatar.tsx` (T-023-b, sous-agent
  frontend) — SVG vectoriel pur (viewBox 0 0 120 130, `xMidYMax meet`),
  props `{ hair: HairId; outfit: Outfit; skin: SkinId; className?; label? }`,
  lookup maps typées depuis `HAIRSTYLES`/`SKIN_TONES`/`OUTFITS` (zéro couleur
  en dur), couches : oreilles → cheveux arrière (afro/dreads) → buste+tenue
  → cou → tête → visage → cheveux avant (casque/cornrows/ombres) → détails
  tenue (wax, cordons, col). Rendu net 40 px (HUD) et 160 px (création).
- **Données** `data.ts` : `HAIRSTYLES` (id/label/desc/color), `SKIN_TONES`
  (id/label/color). Types `HairId`/`SkinId`/`HairDef`/`SkinDef` dans
  `types.ts`.
- **Moteur** : `newGameState(name, outfit, hair="coupe", skin="cafe")`,
  `GameState.version: 2`, helper `withLookDefaults()` (idempotent).
- **Store** : `newGame(name, outfit, hair, skin)` ; persist `version: 2` +
  `migrate` (v1→v2) ; cloud `loadCloud` accepte v1 et v2 puis normalise.
- **Aucune image binaire** : SVG = changement de look instantané, palette
  contrôlée, poids nul, accessible (`role="img"` + label).

## 4. Hors périmètre (itérations futures)

- Avatar des PNJ, animations (clignement, respiration), accessoires
  (lunettes, chaîne), âge/genre, prévisualisation grand format au clic.
- ☐ AGENT 2 (QA/PO) : revue spec/implémentation
