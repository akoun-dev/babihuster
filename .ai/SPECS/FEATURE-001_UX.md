# FEATURE-001_UX — « ABIDJAN HUSTLE : LE RÊVE IVOURIEN » — Vertical Slice Web

> Phase 0 — AGENT UX/UI DESIGNER. Source : cahier des charges utilisateur (GDD v2, découpage modulaire, système de couleurs). Validation UX par AGENT 2 : ✅ 2026-10-30

## 1. Personas

| Persona | Profil | Besoin joueur |
|---|---|---|
| **Le Curieux** (diaspora / étranger) | Découvre la culture ivoirienne via le jeu | Explorer, comprendre le nouchi (glossaire), progresser sans friction |
| **Le Babisto** (Ivoirien, 18-35) | Se reconnaît dans les codes | Humour authentique, mécaniques locales (tontine, dash, transports), fierté culturelle |
| **Le Speedrunner mobile** | Joue sur téléphone, sessions courtes | Partie jouable d'une main, HUD lisible, sauvegarde auto |

## 2. Acteurs concernés

| Acteur | Usage | Interface dédiée |
|---|---|---|
| **JOUEUR** (Guest, non authentifié) | Crée un personnage, joue, sauvegarde (local + cloud anonyme) | Tout le jeu (`src/components/guest/`) |
| VISITEUR (avant partie) | Découvre le pitch sur le menu principal | Écran menu (composants shared + guest) |

*Pas d'ADMIN dans ce slice (outils d'équilibrage = Phase P2, roadmap).*

## 3. User flows PAR acteur

### JOUEUR — boucle principale
```
MENU ──"Nouvelle partie"──> CRÉATION ──valider──> JEU
  │                              │                  │
  └──"Continuer" (si save)──────────────┐            │
                                        ▼            ▼
JEU : [Carte: choisir zone] → [Panneau: action/transport] → résultat + dialogue
      ↕ jauges/temps/argent mis à jour · événements aléatoires (popups à choix)
      ↕ missions offertes via PNJ · tontine · glossaire contextuel
      └─ minuit dépassé → écroulement forcé → résumé du jour → J+1 06:00 (save auto)
```

### VISITEUR
```
MENU ─ pitch + captures mécaniques ──"Comment jouer"──> aide ──retour──> MENU
```

## 4. Wireframes (textuels)

### Écran MENU (remplace le landing actuel, route `/`)
```
┌──────────────────────────────────────────────────────────┐
│ [Header shared : logo + ABIDJAN HUSTLE · badge "Slice"]  │
├──────────────────────────────────────────────────────────┤
│   🌅 dégradé "Coucher de soleil sur la lagune"           │
│        ABIDJAN HUSTLE                                    │
│        Le Rêve Ivoirien — Vertical Slice : Yopougon      │
│   [ ▶ NOUVELLE PARTIE ]   [ ⏩ CONTINUER (si save) ]     │
│   [ Comment jouer ]  [ 📖 Glossaire Nouchi ]             │
│   Mini-cards : "3 mécaniques" (Système D · Tontine · Dash)│
├──────────────────────────────────────────────────────────┤
│ [Footer shared sticky — inchangé]                         │
└──────────────────────────────────────────────────────────┘
```

### Écran JEU (desktop ≥ lg : 3 colonnes / mobile : pile verticale)
```
┌───────────────────────────────────────────────────────────────┐
│ HUD : J3 · 14:30 ☀️ | 💰 4 500 F | 🍗 62% ⚡ 55% 😊 70% 🚿 40% │
│        [Tontine ✅ J6] [Missi ons (2)] [📖] [💾] [⏸]          │
├──────────────┬────────────────────────────┬───────────────────┤
│ CARTE YOP    │  ZONE : Chez Tantie Rose   │ JOURNAL (scroll)  │
│ ┌──────────┐ │  (desc + PNJ présents)     │ 14:30 Garba mangé │
│ │Chambre ✅│ │  ┌──────────────────────┐  │ 13:55 Gbaka 100 F │
│ │Maquis ←  │ │  │ ACTIONS:             │  │ 12:10 Job porteur │
│ │Marché    │ │  │ 🍢 Garba (1 000 F)   │  │ "Gnaman!"         │
│ │Gare      │ │  │ 🕺 Danser (500 F)    │  │                   │
│ │Carrefour │ │  │ 💬 Parler à Tantie   │  │ [Réputation 12]   │
│ │Terrain   │ │  └──────────────────────┘  │                   │
│ └──────────┘ │  TRANSPORT : 🚶 🚌 🏍️       │                   │
├──────────────┴────────────────────────────┴───────────────────┤
│ [Footer shared sticky]                                         │
└───────────────────────────────────────────────────────────────┘
```

### Popups
- **ÉVÉNEMENT** (modal centré) : icône + titre (« Coupure CIE ! ») + texte nouchi + 1-2 boutons de choix (ex. « Payer le dash 2 000 F » / « "Y a pas le problème, patron…" (Tchatche) »).
- **DIALOGUE** (bas de l'écran, style VN) : portrait-icône + nom PNJ + réplique, **mots nouchi surlignés** (tooltip glossaire au clic/hover), boutons de réponses (0-3).
- **RÉSUMÉ DU JOUR** (modal) : gains/dépenses, XP gagnés, missions, « Jour suivant ».
- **MISSIONS** (sheet/drawer latéral) : onglets Offertes/Actives/Terminées + étapes avec ✅.

## 5. États (tous les écrans)

| État | Traitement |
|---|---|
| Loading (load cloud) | Skeleton du menu + spinner "On arrive…" |
| Erreur API save/load | Toast destructive + fallback localStorage (jamais de perte) |
| Empty (aucune save, journal vide jour 1) | Message "Ta première journée t'attend, môgô !" |
| Disabled (action impossible) | Bouton grisé + raison (argent/temps/jauge) dans tooltip |
| Success (action) | Toast positive + animation légère du solde FCFA |

## 6. Interactions & feedback
- Transitions d'écran : fade/slide Framer Motion (respect `prefers-reduced-motion` — déjà en place).
- Solde FCFA : compteur animé quand il change.
- Jauges : barres avec transitions 300ms ; seuil < 25% → pulsation d'alerte.
- Boutons de zones : état actif = bordure Terre Rouge + fond légèrement éclairci.
- Sons : **hors scope slice** (assets audio à produire — roadmap S2.5 du GDD).

## 7. Accessibilité
- Navigation clavier complète (zones = boutons, modal avec focus trap via shadcn Dialog/AlertDialog).
- `aria-live="polite"` sur le journal et les toasts.
- Contrastes validés (voir §9). Icônes décoratives `aria-hidden`.
- Glossaire accessible au clavier (focus sur mot surligné → tooltip).

## 8. Design system
- Réutiliser shadcn : Button, Card, Badge, Dialog, AlertDialog, Sheet, Tooltip, Progress, Tabs, ScrollArea, Separator, Toaster (déjà monté), Skeleton.
- Nouveau : `src/components/guest/**` uniquement pour le jeu. Header/Footer = shared (adaptation du titre via props/constante).

## 9. Responsive
- **Mobile (< lg)** : HUD 2 lignes compactes ; carte en liste verticale ; panneau d'actions sous la carte ; journal replié (Sheet).
- **Tablet (md)** : 2 colonnes (carte | centre).
- **Desktop (lg+)** : 3 colonnes fixes (carte 280px | centre flex-1 | journal 300px).
- Cibles tactiles ≥ 44px partout (règle du socle).

## 10. Composants partagés vs spécifiques
- **Shared** : Header, Footer, composants ui/. Aucune logique de jeu dans shared/.
- **Guest (JOUEUR)** : GameShell, MainMenu, CharacterCreation, GameHUD, CityMap, ActionPanel, TransportPicker, DialogueBox, EventDialog, DaySummary, MissionSheet, JournalLog, GlossarySheet, HowToPlay.
- **Interdits** : import guest→shared inversé, logique de jeu dans ui/.

## 11. Palette (extraite du cahier des charges — normative)
| Rôle | Token CSS | HEX |
|---|---|---|
| Fond principal | `--game-bg` | `#1A1410` (Noir Maquis) |
| Panneaux/cartes | `--game-panel` | `#3A2E24` |
| Texte principal | `--game-text` | `#F5F1E8` (Blanc Harmattan) |
| Texte secondaire | `--game-muted` | `#A89A82` |
| Signature / alerte chaude | `--game-terre` | `#B5451B` (Terre Rouge) |
| Highlight / or / XP | `--game-soleil` | `#F4B942` (Soleil Ivoire) |
| Succès / santé | `--game-vert` | `#2D6A4F` → éclairci `#009A44` (Vert Ivoirien, tricolore) |
| Objectif / alerte | `--game-orange` | `#F37021` (Orange Ivoirien, tricolore) |
| Nuit / mélancolie | `--game-nuit` | `#1B3A5C` (Bleu Nuit) |
| Bordures "enseigne tricolore" | bordure 3 tons `#F37021`/`#FFFFFF`/`#009A44` | — |
- Jauges : faim=#F4B942, énergie=#F37021, moral=#009A44, hygiène=#4FA8C9, réputation=#B5451B.
- Règles GDD : contraste texte ≥ 4.5:1, jamais rouge/vert adjacents sans séparateur, icônes + couleur (daltonisme), 60-30-10.
- Dégradé héros menu : `#E8856C → #F4B942 → #2D6A4F`.

## 12. Validation UX
- ☑ Wireframes revus : cohérents avec le HUD/JDD (jauges Sims + carte GTA-lite).
- ☑ VALIDÉ par AGENT 2 le 2026-10-30 (acteurs couverts, états complets, a11y planifiée).
