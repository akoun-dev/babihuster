/**
 * Types du moteur de jeu Abidjan Hustle — Vertical Slice Web.
 * Acteur : shared (contrats consommés par le store et l'UI guest).
 * Source de vérité : .ai/SPECS/FEATURE-001_TECH.md (contrats figés).
 */

export type ZoneId = "chambre" | "maquis" | "marche" | "gare" | "carrefour" | "terrain";

export type SkillId = "tchatche" | "systemeD" | "endurance" | "reseau";

export type TransportId = "pied" | "gbaka" | "jakarta";

export type NeedId = "faim" | "energie" | "moral" | "hygiene";

export type Outfit = "pagne" | "streetwear" | "costard";

/** Coiffure du personnage (T-023, FEATURE-003) — voir HAIRSTYLES (data.ts) */
export type HairId = "rase" | "coupe" | "degrade" | "dreads" | "tresses" | "afro";

/** Teinte de peau du personnage (T-023, FEATURE-003) — voir SKIN_TONES (data.ts) */
export type SkinId = "noisette" | "cafe" | "chocolat" | "ebene";

export type MissionId = "m1" | "m2" | "m3";

export type MissionStatus = "locked" | "offered" | "active" | "done" | "failed";

export type JournalKind = "info" | "good" | "bad" | "money";

/** 0..100 — faim/énergie/moral/hygiène */
export interface Needs {
  faim: number;
  energie: number;
  moral: number;
  hygiene: number;
}

/** XP cumulé + niveau (paliers 0/10/25/45/70, niveau 1..5) */
export interface Skill {
  xp: number;
  level: number;
}

export interface Inventory {
  matelas: boolean;
  tenueSoiree: boolean;
  provisions: number;
  telephone: boolean;
}

export interface JournalEntry {
  t: string; // "J2 · 14:30"
  text: string;
  kind: JournalKind;
}

/** Événement interactif résolu par l'UI (choix → Outcome précalculé) */
export interface EventChoice {
  id: string;
  label: string;
  outcome: Outcome;
}

export interface Outcome {
  text: string;
  money?: number;
  needs?: Partial<Needs>;
  xp?: Partial<Record<SkillId, number>>;
  rep?: number;
  flags?: Record<string, boolean | number>;
  log: string;
  kind: JournalKind;
}

export interface PendingEvent {
  id: string;
  title: string;
  icon: string;
  text: string;
  choices: EventChoice[];
}

export interface MissionState {
  status: MissionStatus;
  step: number;
  deadline: { day: number; minute: number } | null;
}

export interface TontineState {
  member: boolean;
  daysPaid: number;
  payoutDay: number | null;
}

/** État complet, sérialisable (localStorage + cloud). version pour migrations. */
export interface GameState {
  /** v1 = avant avatar (T-023) ; v2 = coiffure + peau. Anciennes saves migrées. */
  version: 1 | 2;
  name: string;
  outfit: Outfit;
  /** v2 — absent des saves v1 (défaut appliqué à la migration) */
  hair?: HairId;
  /** v2 — absent des saves v1 (défaut appliqué à la migration) */
  skin?: SkinId;
  day: number;
  minute: number; // 360 (06:00) → 1560 max (02:00 affiché)
  money: number;
  rep: number; // 0..100
  zone: ZoneId;
  needs: Needs;
  skills: Record<SkillId, Skill>;
  inventory: Inventory;
  missions: Record<MissionId, MissionState>;
  tontine: TontineState;
  flags: Record<string, boolean | number>;
  pendingEvent: PendingEvent | null;
  pendingSummary: boolean; // true → l'UI doit afficher le résumé du jour
  journal: JournalEntry[]; // max 60 (découpé par le moteur)
  dayStats: { earned: number; spent: number };
}

/** Définition d'une action contextuelle de zone (data.ts) */
export interface ActionDef {
  id: string;
  zone: ZoneId;
  label: string;
  desc: string;
  icon: string;
  minutes: number;
  cost: number;
  needs?: Partial<Needs>;
  xp?: Partial<Record<SkillId, number>>;
  rep?: number;
  money?: number; // gain positif (jobs, gratter)
  negotiable?: boolean;
  noEvent?: boolean;
  /** Raison de blocage (string) ou null si disponible */
  condition?: (s: GameState) => string | null;
  /** Effet spécial hors schéma standard (achats, parler…) */
  special?:
    | "matelas"
    | "provisions"
    | "tenue"
    | "tontineJoin"
    | "tontinePay"
    | "envoiVillage"
    | "talk";
  npcId?: string;
}

/** Définition d'une coiffure (data.ts) */
export interface HairDef {
  id: HairId;
  label: string;
  desc: string;
  /** Couche expressive (pastille radio-card, swatch) */
  color: string;
}

/** Définition d'une teinte de peau (data.ts) */
export interface SkinDef {
  id: SkinId;
  label: string;
  /** Couleur hex du visage rendu par Avatar */
  color: string;
}

export interface TransportDef {
  id: TransportId;
  label: string;
  icon: string;
  minutes: number;
  cost: number;
  energy: number;
  riskChance: number;
  riskLabel: string;
}

export interface ZoneDef {
  id: ZoneId;
  name: string;
  subtitle: string;
  icon: string;
  color: string; // couleur signature (palette GDD)
  description: string;
}

export interface NpcDef {
  id: string;
  name: string;
  zone: ZoneId;
  role: string;
  icon: string;
  lines: string[];
  /** Mission offerte si statut locked + conditions remplies */
  offerMission?: MissionId;
}

export interface MissionDef {
  id: MissionId;
  title: string;
  giver: string;
  icon: string;
  pitch: string;
  steps: string[];
  reward: string;
}

export interface GlossaryEntry {
  word: string;
  def: string;
}

/** Compétences : libellés FR pour l'UI */
export const SKILL_LABELS: Record<SkillId, string> = {
  tchatche: "Tchatche",
  systemeD: "Système D",
  endurance: "Endurance",
  reseau: "Réseau",
};

export const NEED_LABELS: Record<NeedId, string> = {
  faim: "Faim",
  energie: "Énergie",
  moral: "Moral",
  hygiene: "Hygiène",
};
