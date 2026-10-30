# FEATURE-002 — Voix de l'onboarding (TTS)

> Demande utilisateur directe (T-021) : « Ajoute la voix dans le onboarding. »
> Spec condensée (phases 0-2 fusionnées) : feature incrémentale à faible risque
> construite sur les textes statiques existants de FEATURE-001.

## 1. Contexte & objectif

L'onboarding (MENU → CRÉATION → tutoriel « L'arrivée au pays ») repose
entièrement sur du texte. La voix ajoute : accessibilité (lecteurs fatigués,
dyslexie), immersion (le nouchi se vit à l'oral) et un ton de narration
« maquis » conforme à la DA.

## 2. Acteur & user stories

Acteur unique : **JOUEUR (guest)** — référence `.ai/ACTORS.md`.

| # | User story | Critère d'acceptation |
|---|---|---|
| US-1 | En tant que visiteur du menu, j'écoute le pitch d'arrivée | Bouton « Écouter » sur le panneau « Ton histoire » ; re-clic = stop |
| US-2 | En tant que nouveau joueur, j'écoute l'intro pendant la création de personnage | Même bouton sur l'écran Création (même INTRO_TEXT) |
| US-3 | En tant que nouveau joueur, j'écoute les 6 leçons de « Comment jouer » | Bouton dans le dialog, lecture enchaînée des leçons |
| US-4 | En tant que joueur, j'entends chaque réplique du tutoriel Momoh | Bouton par réplique ; changer de réplique coupe la voix courante |
| US-5 | En tant que joueur, je ne subis jamais deux voix simultanées | Singleton audio global ; toute nouvelle lecture stoppe la précédente |

## 3. Design technique

- **API** `POST /api/game/tts` (`src/app/api/game/tts/route.ts`) — backend
  uniquement (SDK `z-ai-web-dev-sdk`, interdiction client). Entrées validées
  : texte ≤ 1024 car. (limite SDK), voix dans allowlist, speed ∈ [0.5, 2.0].
  Cache mémoire FIFO (64 entrées, clé SHA-256 texte|voix|speed) : textes
  statiques → hit garanti après la 1ʳᵉ écoute. Sortie `audio/wav`.
- **Hook** `useVoice` (`src/hooks/use-voice.ts`) — mini-store externe
  (`useSyncExternalStore`), `<audio>` singleton, cache de blobs en session,
  file séquentielle avec découpe par phrases ≤ 900 caractères, jeton
  d'annulation, erreurs → toast destructif.
- **Composant** `VoiceButton` (`src/components/guest/VoiceButton.tsx`) —
  icônes Volume2 / Loader2 (loading) / pulse (playing), `aria-pressed`,
  `aria-label` avec extrait du texte, focus ring Soleil Ivoire.
- **Intégrations** : `MainMenu` (pitch), `CharacterCreation` (intro),
  `HowToPlay` (leçons enchaînées), `DialogueBox` (réplique courante).

## 4. États

| État | Rendu |
|---|---|
| idle | Volume2, bordure Soleil Ivoire 40 % |
| loading (génération) | Loader2 animé, bouton actif mais re-clic possible (toggle) |
| playing | Volume2 + pulse + fond Soleil Ivoire 20 %, `aria-pressed=true` |
| error | toast « Voix indisponible » + retour idle (pas de blocage UI) |

## 5. Accessibilité & responsive

- Touch target 36 px ≥ recommandation composants icônes secondaires, bouton
  redondant avec le texte affiché (jamais seule source d'information).
- Annonce ARIA : `aria-pressed` + label dynamique « Écouter / Arrêter ».
- Aucun autoplay : la lecture exige un clic (politique navigateurs + confort).
- Responsive : bouton absolu dans les en-têtes de panneaux, aucun reflow
  (taille fixe `size-9`).

## 6. Limites connues & suite

- Voix `tongtong` : accent non ivoirien (voix multilingue générique) —
  doublages par PNJ (M2.6 du backlog GDD) = itération future.
- Le nouchi est lu tel quel (prononciation approchée) — acceptable pour la
  vertical slice ; glossaire audio envisagé plus tard.
- Volume non exposé dans l'UI (réglage natif du navigateur).
- **Latence de 1ʳᵉ génération mesurée (audit navigateur)** : 1,2 s (pitch) →
  5,2 s (réplique) → 22,4 s (leçons ~700 car.) ; ensuite instantané grâce au
  double cache (client blob + serveur mémoire). Préfetch à l'ouverture du
  dialog = optimisation candidate (hors périmètre T-021).

## 7. Validation

- ☐ AGENT 2 (QA/PO) : revue de conformité spec/implémentation
- ☑ Audit navigateur (2025, orchestrator) : lecture effective des 4 points
  (POST 200 audio/wav, `aria-pressed=true` + pulse en lecture, toggle stop,
  coupure au changement de réplique et à la navigation, 0 erreur console,
  mobile 390 px sans débordement), latences consignées §6
  — preuves : `.ai/screenshots/feat-002-voice-*.png`, `dev.log`

---

## 8. Révision A — pivot Web Speech API (retour utilisateur T-021b)

> Retour : « au niveau de "Ton histoire" la voix n'est pas en français ».
> Cause : les voix du SDK TTS (`tongtong` & co.) sont orientées zh/en — le
> français ivoirien était prononcé avec l'accent/phonétique d'une autre langue.

**Décision (ADR de révision)** : abandon du SDK TTS backend au profit de
l'API native `window.speechSynthesis` (Web Speech API) avec voix
française de l'appareil (`lang="fr-FR"`, voix locale préférée).

| Critère | Avant (SDK TTS) | Après (Web Speech API) |
|---|---|---|
| Français | ✗ (accent zh/en) | ✓ voix fr natives de l'appareil |
| Latence | 1,2 → 22,4 s (1ʳᵉ fois) | ~0 (instantané) |
| Coût serveur | POST + cache mémoire | aucun |
| Route `/api/game/tts` | utilisée | **supprimée** (code mort) |
| Contournement Chrome ~15 s | n/a | découpe en phrases ≤ 180 car. en file |

Conséquences :
- `src/hooks/use-voice.ts` réécrit (états réduits à `idle`/`playing` — plus
  de spinner, la lecture démarre immédiatement).
- `src/app/api/game/tts/route.ts` supprimée (le git historise la v1).
- `VoiceButton` simplifié (plus de Loader2).
- Les §3 (design technique API) et §6 (latence) ci-dessus sont obsolètes,
  conservés pour l'historique de décision.

## 9. Validation Révision A

- ☑ Audit navigateur (banc headless SANS moteur TTS — 0 voix exposées) :
  MutationObserver sur `aria-pressed` → transitions `true` (t=68 ms) →
  `false` (t=90 ms, fin immédiate sans voix) sur Menu ET HowToPlay ; stop,
  Escape et changement de réplique remettent `synth.speaking=false` ;
  géométrie dialog contrôlée (bouton 811,85 36×36 — chevauchement description
  : non) ; 0 erreur console ; mobile 390 px sans débordement
  — preuves : `.ai/screenshots/feat-002-revA-voice-mobile.png`
- ⚠ Limite du banc : aucun moteur TTS en headless → l'AUDIBLE français est à
  confirmer sur un navigateur réel (Chrome/Edge/Safari ont des voix fr-FR
  natives : « Google français », « Microsoft Hortense », « Amélie »).
- ☐ AGENT 2 (QA/PO) : revue de la révision
