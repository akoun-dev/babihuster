# FEATURE-001_TECH — Design technique (Phase 2)

> AGENT 1 (Tech Lead) — 2026-10-30. Contrats figés avant implémentation (API-first). Complète ARCHITECTURE.md.

## 1. Architecture (séparation des couches — GOVERNANCE §5)

```
[UI guest/*]  GameShell, HUD, CityMap, ActionPanel, DialogueBox, EventDialog…
      ↓ store (Zustand)
[store.ts]    useGame() : state + actions écran + persist localStorage (version 1)
      ↓ fonctions pures
[engine.ts]   applyAction / startDay / resolveEvent / negotiateCheck — 100 % purs, testables
      ↓ données
[data.ts]     ZONES, ACTIONS, EVENTS, PNJS, MISSIONS, GLOSSAIRE, TRANSPORTS (équilibrage)
      ↓ fetch relatif
[API routes]  POST /api/game/save · GET /api/game/load?deviceId=
      ↓ db (@/lib/db)
[Prisma]      model SaveGame (stateJson String — pas de liste primitive)
```

- **Aucun appel HTTP dans les composants** : cloud save = actions du store.
- **z-ai-web-dev-sdk non requis** pour ce slice (aucune IA générative).
- Temps/jauges : entiers, bornés dans engine (aucune logique métier dans l'UI).

## 2. Types (src/lib/game/types.ts) — contrat figé

```ts
type ZoneId = 'chambre'|'maquis'|'marche'|'gare'|'carrefour'|'terrain';
type SkillId = 'tchatche'|'systemeD'|'endurance'|'reseau';
type TransportId = 'pied'|'gbaka'|'jakarta';
type NeedId = 'faim'|'energie'|'moral'|'hygiene';
type MissionStatus = 'locked'|'offered'|'active'|'done'|'failed';

interface Needs extends Record<NeedId, number> {}                       // 0..100
interface Skill { xp: number; level: number }                           // level 1..5
interface Inventory { matelas: boolean; tenueSoiree: boolean; provisions: number; telephone: boolean }

interface PendingEvent {                                                // résolu par l'UI
  id: string; title: string; icon: string; text: string;
  choices: Array<{ id: string; label: string; outcome: Outcome }>;
}
interface Outcome { text: string; money?: number; needs?: Partial<Needs>; xp?: Partial<Record<SkillId, number>>; rep?: number; log: string; }

interface MissionState { status: MissionStatus; step: number; failAtDayMinute?: number; }

interface GameState {
  version: 1;
  name: string; outfit: 'pagne'|'streetwear'|'costard';
  day: number; minute: number;                 // minute 360 (06:00) → 1560 (02:00 J+1 max clamp)
  money: number; rep: number;                  // rep 0..100
  zone: ZoneId; needs: Needs;
  skills: Record<SkillId, Skill>;
  inventory: Inventory;
  missions: Record<'m1'|'m2'|'m3', MissionState>;
  tontine: { member: boolean; daysPaid: number; payoutDay: number | null };
  flags: Record<string, boolean | number>;
  pendingEvent: PendingEvent | null;
  journal: Array<{ t: string; text: string; kind: 'info'|'good'|'bad'|'money' }>; // max 60
  dayStats: { earned: number; spent: number };
}
```

## 3. Moteur (engine.ts — signatures)

```ts
export function applyAction(s: GameState, actionId: string, rng: () => number = Math.random): GameState
export function travel(s: GameState, to: ZoneId, mode: TransportId, rng: () => number = Math.random): GameState
export function resolveEvent(s: GameState, choiceId: string): GameState
export function closeDaySummary(s: GameState): GameState     // J+1 06:00, jauges nuit, save auto côté store
export function levelUp(xp: number): { xp: number; level: number } // paliers [0,10,25,45,70]
```
Invariants garantis par le moteur : bornes jauges [0,100], money [0,∞), rep [0,100], minute [360, 1560], journal max 60, un seul pendingEvent, missions transitions contrôlées. Écroulement : si l'action termine > 02:00 → auto-sommeil de rue (-30 énergie, log « Tu t'es écroulé… ») puis résumé.

## 4. Store (store.ts)

- `useGame` (Zustand + `persist`, key `abidjan-hustle-save-v1`, `partialize` : uniquement GameState persisté, `version: 1`).
- State UI non persisté : `screen: 'menu'|'creation'|'game'`, `dialogue` courant, `showDaySummary`.
- Actions store : `newGame(name, outfit)`, `doAction(id)`, `travelTo(zone, mode)`, `chooseEvent(id)`, `endDay()`, `saveCloud()`, `loadCloud(deviceId)`, `resetGame()`.
- `deviceId` : uuid v4 en localStorage `abidjan-hustle-device` (généré au 1er save cloud).

## 5. Backend

```prisma
model SaveGame {
  id         String   @id @default(cuid())
  deviceId   String   @unique
  playerName String
  stateJson  String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```
- `POST /api/game/save` : zod `{ deviceId: string uuid, playerName: string 1..20, state: GameStateV1 }` → upsert sur deviceId → `{ ok: true, at: ISO }`. Taille state ≤ 64 KB.
- `GET /api/game/load?deviceId=` : zod → save ou `{ ok: true, save: null }`. **Jamais de 500 sur absence.**
- Erreurs : 400 (validation), 500 loggé ; jamais de secrets. Pas de CORS (même origine).

## 6. UI — plan de composants (dossier `src/components/guest/`, acteur JOUEUR)

| Composant | Rôle | Props clés |
|---|---|---|
| `GameShell.tsx` | 'use client' ; switch screen (menu/creation/game) ; montée du store | — |
| `MainMenu.tsx` | héros dégradé lagune, CTA, cards mécaniques | — |
| `CharacterCreation.tsx` | nom + 3 tenues (radio cards) | — |
| `GameHUD.tsx` | horloge+icône phase jour, FCFA animé, jauges Progress, réputation, boutons (missions Sheet, glossaire Sheet, pause) | state selectors |
| `CityMap.tsx` | 6 cartes zones (icône Lucide + nom + badge « tu es ici »), déplacement via TransportPicker | zone, onTravel |
| `ActionPanel.tsx` | actions de la zone (disabled + raison), achats, jobs ; négociation si marché | zone |
| `DialogueBox.tsx` | répliques PNJ + mots nouchi surlignés (Tooltip) + réponses | npc, lines |
| `EventDialog.tsx` | AlertDialog choices du pendingEvent | event |
| `DaySummary.tsx` | modal résumé J (gains/dépenses/XP) | stats |
| `MissionSheet.tsx` | Sheet onglets offertes/actives/terminées + étapes | — |
| `JournalLog.tsx` | ScrollArea aria-live, pastilles kind | entries |
| `GlossarySheet.tsx` | Sheet liste glossaire | — |
| `HowToPlay.tsx` | Dialog aide | — |

- `page.tsx` (server) : métadonnées + rendu `<GameShell/>` — page unique `/`, footer sticky socle **intouché**.
- Header shared : titre/badge actualisés (constante centrale `src/lib/app-config.ts` — corrige D-002).
- globals.css : bloc variables `--game-*` + classes utilitaires `.game-panel`, `.border-tricolore`, dégradé lagune. Tokens shadcn existants conservés.

## 7. Conformité & tests
- Lint + `tsc --noEmit` obligatoires ; aucune dépendance nouvelle (framer-motion présent si besoin).
- QA : parcours FEATURE-001_SPEC §6 exécutés via Agent Browser.
- Anti-régression : `bun run lint`, footer sticky, skip-link, api/route.ts intact.
