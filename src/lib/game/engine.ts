/**
 * Moteur de jeu Abidjan Hustle — fonctions 100 % pures (aucune UI, aucun fetch).
 * Acteur : shared. Contrats : .ai/SPECS/FEATURE-001_TECH.md §3.
 * Invariants garantis : jauges [0,100], money ≥ 0, rep [0,100], minute [360,1560],
 * journal ≤ 60, un seul pendingEvent, ≤ 1 événement par action.
 */

import {
  ACTIONS,
  MISSIONS,
  NPCS,
  START_MONEY,
  TONTINE_DURATION_DAYS,
  TONTINE_PAYOUT,
  TRANSPORTS,
  XP_PALIERS,
} from "./data";
import type {
  ActionDef,
  GameState,
  HairId,
  JournalKind,
  MissionId,
  NpcDef,
  Outcome,
  Outfit,
  PendingEvent,
  SkinId,
  SkillId,
  TransportId,
  ZoneId,
} from "./types";

type Rng = () => number;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round50 = (v: number) => Math.round(v / 50) * 50;

// ————————————————————————————— Helpers de temps —————————————————————————————

export function formatClock(minute: number): string {
  const m = ((minute % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function journalTime(s: GameState): string {
  return `J${s.day} · ${formatClock(s.minute)}`;
}

export function isNight(minute: number): boolean {
  return ((minute % 1440) + 1440) % 1440 >= 1140;
}

export type DayPhase = "matin" | "apremidi" | "soir" | "nuit" | "profonde";

export function dayPhase(minute: number): DayPhase {
  const m = ((minute % 1440) + 1440) % 1440;
  if (m < 720) return "matin";
  if (m < 1020) return "apremidi";
  if (m < 1140) return "soir";
  if (m < 1440) return "nuit";
  return "profonde";
}

// ————————————————————————————— Getters —————————————————————————————

export function actionById(id: string): ActionDef | undefined {
  return ACTIONS.find((a) => a.id === id);
}
export function zoneById(id: ZoneId) {
  return ZONES_CACHE.find((z) => z.id === id);
}
export function npcById(id: string): NpcDef | undefined {
  return NPCS.find((n) => n.id === id);
}
export function missionById(id: MissionId) {
  return MISSIONS.find((m) => m.id === id);
}
export function transportById(id: TransportId) {
  return TRANSPORTS.find((t) => t.id === id);
}

import { ZONES } from "./data";
const ZONES_CACHE = ZONES;

// ————————————————————————————— Primitives —————————————————————————————

export function levelFromXp(xp: number): number {
  const reached = XP_PALIERS.filter((p) => xp >= p).length;
  return clamp(reached, 1, 5);
}

function addLog(s: GameState, text: string, kind: JournalKind): void {
  s.journal.unshift({ t: journalTime(s), text, kind });
  if (s.journal.length > 60) s.journal.length = 60;
}

function applyNeeds(s: GameState, delta: Partial<GameState["needs"]>): void {
  (Object.keys(delta) as Array<keyof GameState["needs"]>).forEach((k) => {
    const d = delta[k];
    if (typeof d === "number") s.needs[k] = clamp(s.needs[k] + d, 0, 100);
  });
}

function changeMoney(s: GameState, delta: number): void {
  s.money = Math.max(0, s.money + delta);
  if (delta > 0) s.dayStats.earned += delta;
  if (delta < 0) s.dayStats.spent += -delta;
}

function applyXp(s: GameState, xp: Partial<Record<SkillId, number>> | undefined): void {
  if (!xp) return;
  (Object.keys(xp) as SkillId[]).forEach((k) => {
    const add = xp[k];
    if (!add) return;
    const before = s.skills[k].level;
    s.skills[k].xp += add;
    s.skills[k].level = levelFromXp(s.skills[k].xp);
    if (s.skills[k].level > before) {
      const labels: Record<SkillId, string> = {
        tchatche: "Tchatche",
        systemeD: "Système D",
        endurance: "Endurance",
        reseau: "Réseau",
      };
      addLog(s, `${labels[k]} monte niveau ${s.skills[k].level} !`, "good");
    }
  });
}

function applyOutcome(s: GameState, o: Outcome): void {
  if (o.money) changeMoney(s, o.money);
  if (o.needs) applyNeeds(s, o.needs);
  if (o.rep) s.rep = clamp(s.rep + o.rep, 0, 100);
  applyXp(s, o.xp);
  if (o.flags) Object.assign(s.flags, o.flags);
  addLog(s, o.log, o.kind);
}

/** Écroulement forcé : action finissant après 02:00. */
function checkCollapse(s: GameState): void {
  if (s.minute > 1560) {
    s.minute = 1560;
    applyNeeds(s, { energie: -25, moral: -10, hygiene: -8 });
    s.flags.collapsed = true;
    s.pendingSummary = true;
    addLog(s, "02:00 passées : tu t'es écroulé sur le trottoir de Yop…", "bad");
  }
}

/** Échéance de la mission M2 (livraison chronométrée). */
function checkDeadlines(s: GameState): void {
  const m2 = s.missions.m2;
  if (m2.status === "active" && m2.deadline) {
    const late =
      s.day > m2.deadline.day ||
      (s.day === m2.deadline.day && s.minute > m2.deadline.minute);
    if (late) {
      m2.status = "failed";
      s.rep = clamp(s.rep - 3, 0, 100);
      addLog(s, "M2 échouée : les clients ont attendu, mangé elsewhere… Réputation -3.", "bad");
    }
  }
}

/** Filet de sécurité (F-13) : personne ne meurt de faim à Yop. */
function safetyNet(s: GameState): void {
  if (s.needs.faim <= 15 && s.money < 100 && s.flags.safetyDay !== s.day) {
    s.flags.safetyDay = s.day;
    applyNeeds(s, { faim: 30, moral: 5 });
    addLog(s, "Tantie Rose t'a envoyé un plat gratis. Yako, môgô…", "good");
  }
}

function rollEvent(s: GameState, rng: Rng): void {
  if (s.pendingEvent) return;
  const eligible = EVENTS.filter((e) => e.when(s));
  if (eligible.length === 0) return;
  const total = eligible.reduce((acc, e) => acc + e.weight(s), 0);
  let roll = rng() * total;
  for (const e of eligible) {
    roll -= e.weight(s);
    if (roll <= 0) {
      s.pendingEvent = e.build(s, rng);
      return;
    }
  }
}

function checkTchatche(s: GameState, rng: Rng): boolean {
  return rng() < 0.35 + 0.15 * s.skills.tchatche.level;
}
function checkEndurance(s: GameState, rng: Rng): boolean {
  return rng() < 0.3 + 0.16 * s.skills.endurance.level;
}

// ————————————————————————————— Événements aléatoires —————————————————————————————

interface EventDef {
  id: string;
  weight: (s: GameState) => number;
  when: (s: GameState) => boolean;
  build: (s: GameState, rng: Rng) => PendingEvent;
}

const EVENTS: EventDef[] = [
  {
    id: "pluie",
    weight: () => 12,
    when: (s) => s.zone !== "chambre" && !s.flags.pluie,
    build: () => ({
      id: "pluie",
      title: "Saison des pluies !",
      icon: "CloudRain",
      text: "« Kpatakpa ! » — Les premières gouttes tombent. À Yop, quand il pleut, les Gbaka ralentissent pakè.",
      choices: [
        {
          id: "ok",
          label: "Accélérer le pas",
          outcome: {
            text: "Tu te mets sous une bâche. Les trajets seront plus longs aujourd'hui.",
            flags: { pluie: true },
            log: "Il pleut : transports ralentis jusqu'à demain.",
            kind: "info",
          },
        },
      ],
    }),
  },
  {
    id: "ambulant",
    weight: () => 10,
    when: (s) => s.zone === "marche" || s.zone === "carrefour" || s.zone === "gare",
    build: () => ({
      id: "ambulant",
      title: "Vendeur ambulant",
      icon: "Cookie",
      text: "« Beignets chauds, môgô ! 200 F le sachet, c'est le dernier prix ! » L'odeur est trop…",
      choices: [
        {
          id: "acheter",
          label: "Acheter (200 F)",
          outcome: {
            text: "Croustillant à l'extérieur, moelleux dedans. Gnamankoudji !",
            money: -200,
            needs: { faim: 10, moral: 5 },
            log: "Sachet de beignets chauds acheté (-200 F).",
            kind: "good",
          },
        },
        {
          id: "refuser",
          label: "Résister",
          outcome: {
            text: "Tu résistes. Le vendeur hausse les épaules : « C'est gâté pour toi ! »",
            log: "Beignets refusés. Volonté de fer.",
            kind: "info",
          },
        },
      ],
    }),
  },
  {
    id: "police",
    weight: (s) => (s.zone === "carrefour" || s.zone === "gare" ? 15 : 8),
    when: (s) => s.zone !== "chambre" && s.zone !== "maquis",
    build: (s, rng) => {
      const dash = round50(1000 + rng() * 4000);
      const dashNegocie = round50(dash * 0.4);
      const reussi = checkTchatche(s, rng);
      return {
        id: "police",
        title: "Contrôle de police !",
        icon: "ShieldAlert",
        text: `« Papiers ! » — L'agent regarde tes affaires d'un air sceptique. Un petit « dash » pourrait arranger ça (${dash} F)…`,
        choices: [
          {
            id: "payer",
            label: `Payer le dash (${dash} F)`,
            outcome: {
              text: "L'agent empocket le billet d'un air professionnel. « Circulez, mon petit. »",
              money: -Math.min(dash, s.money),
              log: `Dash versé à l'agent (-${Math.min(dash, s.money)} F). Sans commentaire.`,
              kind: "bad",
            },
          },
          {
            id: "negocier",
            label: "« Y a pas le problème, patron… » (Tchatche)",
            outcome: reussi
              ? {
                  text: "Ton nouchi est si fluide que l'agent rit et te laisse partir. « Va, c'est fôô ! »",
                  rep: 1,
                  xp: { tchatche: 3 },
                  log: "Dash évité par la seule force du nouchi. Respect.",
                  kind: "good",
                }
              : {
                  text: "Ton argumentation embrouille même l'agent… Il finit par prendre un « pourboire de paix ».",
                  money: -Math.min(dashNegocie, s.money),
                  log: `Dash réduit par négociation (-${Math.min(dashNegocie, s.money)} F).`,
                  kind: "bad",
                },
          },
        ],
      };
    },
  },
  {
    id: "microbes",
    weight: () => 15,
    when: (s) => s.zone === "terrain" && isNight(s.minute),
    build: (s, rng) => {
      const perte = round50(500 + rng() * 700);
      const negocie = checkTchatche(s, rng);
      const bataille = checkEndurance(s, rng);
      return {
        id: "microbes",
        title: "Les microbes !",
        icon: "Swords",
        text: "Trois silhouettes t'encerclent dans le noir. « Balance le tchen, môgô, sinon c'est ziguitoire ! »",
        choices: [
          {
            id: "courir",
            label: "Courir à toutes jambes",
            outcome: {
              text: "Tu cours comme au foot de dimanche. Ils te perdent entre les niams.",
              needs: { energie: -15 },
              log: "Fuite rapide devant les microbes. Souffle court.",
              kind: "info",
            },
          },
          {
            id: "negocier",
            label: "Négocier (Tchatche)",
            outcome: negocie
              ? {
                  text: "Tu les fais rire avec un storytelling pakè. Ils te laissent partir avec le respect.",
                  rep: 2,
                  xp: { tchatche: 3 },
                  log: "Microbes désamorcés par le verbe. Légende du quartier.",
                  kind: "good",
                }
              : {
                  text: "Ton baratin tombe à plat. Ils te « taxent » un billet avant de partir.",
                  money: -Math.min(perte, s.money),
                  needs: { hygiene: -10 },
                  log: `Microbes : perte de ${Math.min(perte, s.money)} F et de dignité.`,
                  kind: "bad",
                },
          },
          {
            id: "battre",
            label: "Se battre (Endurance)",
            outcome: bataille
              ? {
                  text: "Ton gigot de dimanche paie ! Ils reculent. Le quartier parlera de toi.",
                  rep: 4,
                  needs: { energie: -20 },
                  log: "Microbes repoussés à la puissance des mollets. +Réputation.",
                  kind: "good",
                }
              : {
                  text: "Mauvaise idée. Tu mords la poussière rouge et perds ton argent du jour.",
                  money: -Math.min(800, s.money),
                  needs: { energie: -30, hygiene: -20 },
                  log: "Défaite face aux microbes. Le gbonhi te ramène à la maison.",
                  kind: "bad",
                },
          },
        ],
      };
    },
  },
  {
    id: "cie",
    weight: () => 20,
    when: (s) => s.zone === "chambre" && isNight(s.minute),
    build: () => ({
      id: "cie",
      title: "Coupure CIE !",
      icon: "LightbulbOff",
      text: "Blackout total dans le quartier. Le ventilateur s'arrête, la chaleur arrive…",
      choices: [
        {
          id: "groupe",
          label: "Allumer le groupe (500 F)",
          outcome: {
            text: "Vroum vroum vroum. Le quartier grogne, mais toi tu as la lumière.",
            money: -500,
            needs: { moral: -3 },
            log: "Groupe électrogène allumé (-500 F de carburant).",
            kind: "info",
          },
        },
        {
          id: "bougie",
          label: "Dormir à la bougie",
          outcome: {
            text: "Bougies + chaleur + moustiques. La vie de Yop, frère.",
            needs: { moral: -6 },
            log: "Nuit à la bougie, blackout jusqu'au matin.",
            kind: "info",
          },
        },
      ],
    }),
  },
  {
    id: "aideAdjoua",
    weight: () => 8,
    when: (s) => s.zone === "marche" && s.rep >= 10 && s.flags.aideToday !== s.day,
    build: () => ({
      id: "aideAdjoua",
      title: "Maman Adjoua a besoin de toi",
      icon: "HandHeart",
      text: "« Mon fils ! Porte ces sacs pour moi, please. »",
      choices: [
        {
          id: "aider",
          label: "Aider (gratuit)",
          outcome: {
            text: "Tu portes les sacs comme un champion. Elle te donne l'attiéké et les rumeurs du marché.",
            needs: { faim: 20, moral: 8 },
            rep: 2,
            flags: { aideToday: 0 },
            log: "Sacs de Maman Adjoua portés. Attiéké offerte + rumeurs du marché.",
            kind: "good",
          },
        },
      ],
    }),
  },
];

// ————————————————————————————— Progression des missions —————————————————————————————

function progressMissions(s: GameState): void {
  const m1 = s.missions.m1;
  const m2 = s.missions.m2;
  const m3 = s.missions.m3;

  if (m1.status === "active" && m1.step === 0 && s.inventory.matelas) {
    m1.step = 1;
    addLog(s, "M1 : matelas en poche ! Direction la chambre pour la première vraie nuit.", "good");
  }
  if (m1.status === "active" && m1.step === 1 && s.flags.justSleptWithMatelas) {
    delete s.flags.justSleptWithMatelas;
    m1.status = "done";
    changeMoney(s, 300);
    s.rep = clamp(s.rep + 5, 0, 100);
    addLog(s, "M1 terminée ! La Tantie t'offre 300 F « pour la propreté ». +5 Réputation.", "good");
  }
  if (m2.status === "active") {
    if (m2.step === 0 && s.zone === "marche") {
      m2.step = 1;
      addLog(s, "M2 : colis d'attiékés récupérés au marché. Livraison au carrefour Siporex !", "good");
    } else if (m2.step === 1 && s.zone === "carrefour") {
      m2.status = "done";
      changeMoney(s, 3000);
      s.rep = clamp(s.rep + 10, 0, 100);
      addLog(s, "M2 livrée à temps ! 3 000 F et une réputation d'homme sérieux. +10 Réputation.", "money");
    }
  }
  if (m3.status === "active" && s.flags.enjaillementDone) {
    delete s.flags.enjaillementDone;
    m3.status = "done";
    s.rep = clamp(s.rep + 15, 0, 100);
    addLog(
      s,
      "M3 terminée ! Serge t'a serré la main devant tout le maquis : « Tu es des nôtres. » +15 Réputation.",
      "good",
    );
  }
}

// ————————————————————————————— État initial —————————————————————————————

export function newGameState(
  name: string,
  outfit: Outfit,
  hair: HairId = "coupe",
  skin: SkinId = "cafe",
): GameState {
  const blank: GameState = {
    version: 2,
    name: name.trim() || "Môgô",
    outfit,
    hair,
    skin,
    day: 1,
    minute: 420,
    money: START_MONEY,
    rep: 5,
    zone: "gare",
    needs: { faim: 65, energie: 75, moral: 60, hygiene: 65 },
    skills: {
      tchatche: { xp: 0, level: 1 },
      systemeD: { xp: 0, level: 1 },
      endurance: { xp: 0, level: 1 },
      reseau: { xp: 0, level: 1 },
    },
    inventory: { matelas: false, tenueSoiree: false, provisions: 0, telephone: true },
    missions: {
      m1: { status: "locked", step: 0, deadline: null },
      m2: { status: "locked", step: 0, deadline: null },
      m3: { status: "locked", step: 0, deadline: null },
    },
    tontine: { member: false, daysPaid: 0, payoutDay: null },
    flags: { introSeen: false },
    pendingEvent: null,
    pendingSummary: false,
    journal: [],
    dayStats: { earned: 0, spent: 0 },
  };
  addLog(blank, `Jour 1 — Tu poses le pied à la gare de Yopougon avec ${START_MONEY} F. On a mis le pays !`, "info");
  return blank;
}

/**
 * Migration look v1 → v2 (T-023) : les anciennes saves n'ont ni `hair` ni
 * `skin` — on applique les défauts (coupe courte, peau café) sans toucher
 * au reste de l'état. Idempotent (safe sur un état déjà v2).
 */
export function withLookDefaults<T extends { version?: number; hair?: HairId; skin?: SkinId }>(
  state: T,
): T & { version: 1 | 2; hair: HairId; skin: SkinId } {
  return {
    ...state,
    version: 2,
    hair: state.hair ?? "coupe",
    skin: state.skin ?? "cafe",
  };
}

// ————————————————————————————— Actions —————————————————————————————

export function actionBlockedReason(s: GameState, action: ActionDef): string | null {
  if (action.zone !== s.zone) return null;
  if (action.id === "enjailler" && s.missions.m3.status !== "active") {
    return "Activable seulement avec la mission M3 active.";
  }
  if (action.condition) return action.condition(s);
  if (action.cost > 0 && s.money < action.cost) {
    return `Il te faut ${action.cost} F (tu as ${s.money} F).`;
  }
  return null;
}

function discountedCost(cost: number, tchatcheLevel: number, rng: Rng): { cost: number; reussi: boolean } {
  const reussi = rng() < 0.35 + 0.1 * tchatcheLevel;
  if (!reussi) return { cost, reussi };
  const remise = 0.1 + 0.05 * tchatcheLevel;
  return { cost: round50(cost * (1 - remise)), reussi };
}

export function applyAction(state: GameState, actionId: string, rng: Rng = Math.random): GameState {
  const action = actionById(actionId);
  if (!action || action.zone !== state.zone || action.special === "talk") return state;
  if (actionBlockedReason(state, action)) return state;

  const s: GameState = structuredClone(state);

  // — Cas spécial : dormir —
  // NOTE : le passage au lendemain est fait par closeDaySummary() (appellé via
  // endDay() du store quand l'UI ferme le résumé). Ici on ne fait qu'appliquer
  // les effets du sommeil et poser pendingSummary — sinon double saut de jour.
  if (action.id === "dormir") {
    if (s.inventory.matelas) {
      applyNeeds(s, { energie: 70, faim: -25, hygiene: -12, moral: 6 });
      s.flags.justSleptWithMatelas = true;
      addLog(s, "Premier sommeil sur ton propre matelas. C'est fôô.", "good");
    } else {
      applyNeeds(s, { energie: 40, faim: -25, hygiene: -12, moral: -5 });
      addLog(s, "Nuit sur le carrelage : dos en compote. Le matelas, c'est pas du luxe.", "bad");
    }
    s.pendingSummary = true;
    progressMissions(s);
    checkDeadlines(s);
    return s;
  }

  // — Cas spécial : s'enjailler (fin M3) —
  if (action.id === "enjailler") {
    changeMoney(s, -action.cost);
    applyNeeds(s, action.needs ?? {});
    s.flags.enjaillementDone = true;
    addLog(s, "Serge a levé son verre : « À Yop City ! » La soirée est légendaire.", "money");
    progressMissions(s);
    return s;
  }

  // — Cas standard —
  let cost = action.cost;
  if (action.negotiable && cost > 0) {
    const { cost: c, reussi } = discountedCost(cost, s.skills.tchatche.level, rng);
    cost = c;
    if (reussi) {
      addLog(s, `Tchatche au top : prix discuté de ${action.cost} F à ${c} F !`, "good");
    } else {
      addLog(s, "La discussion n'a pas pris… Prix plein, môgô.", "info");
    }
  }
  if (cost > 0) changeMoney(s, -cost);
  if (action.money) {
    const gain =
      action.id === "gratterCarrefour"
        ? round50(300 + rng() * 900)
        : action.money;
    changeMoney(s, gain);
    addLog(s, `Djossi terminé : +${gain} F en poche.`, "money");
  }
  applyNeeds(s, action.needs ?? {});
  applyXp(s, action.xp);
  if (action.rep) s.rep = clamp(s.rep + action.rep, 0, 100);

  switch (action.special) {
    case "matelas":
      s.inventory.matelas = true;
      addLog(s, "Matelas acheté et transporté jusqu'à la chambre. Le luxe absolu.", "good");
      break;
    case "provisions":
      s.inventory.provisions += 1;
      break;
    case "tenue":
      s.inventory.tenueSoiree = true;
      addLog(s, "Tenue de soirée en pagne : tu vas banana ce soir !", "good");
      break;
    case "tontineJoin":
      s.tontine.member = true;
      s.tontine.daysPaid = 1;
      s.tontine.payoutDay = s.day + TONTINE_DURATION_DAYS;
      s.flags.lastTontineDay = s.day;
      addLog(
        s,
        `Tontine rejointe chez Maman Adjoua ! Gros pot de ${TONTINE_PAYOUT} F dans ${TONTINE_DURATION_DAYS} jours (J${s.tontine.payoutDay}).`,
        "money",
      );
      break;
    case "tontinePay":
      s.tontine.daysPaid += 1;
      s.flags.lastTontineDay = s.day;
      addLog(s, `Cotisation versée (jour ${s.tontine.daysPaid}). Le pot commun grossit.`, "info");
      break;
    case "envoiVillage":
      addLog(s, "Mandat envoyé au village. La maman a pleuré au téléphone. Le cœur est léger.", "good");
      break;
    default:
      break;
  }

  s.minute += action.minutes;
  progressMissions(s);
  safetyNet(s);
  if (!action.noEvent) rollEvent(s, rng);
  checkDeadlines(s);
  checkCollapse(s);
  return s;
}

// ————————————————————————————— Déplacements —————————————————————————————

export function travel(
  state: GameState,
  to: ZoneId,
  mode: TransportId,
  rng: Rng = Math.random,
): GameState {
  if (to === state.zone) return state;
  const t = transportById(mode);
  if (!t) return state;

  const s: GameState = structuredClone(state);
  if (s.money < t.cost) return state;

  const pluie = Boolean(s.flags.pluie);
  const minutes = pluie ? Math.round(t.minutes * 1.5) : t.minutes;
  if (t.cost > 0) changeMoney(s, -t.cost);
  if (t.energy) applyNeeds(s, { energie: -t.energy });
  s.zone = to;
  s.minute += minutes;
  addLog(
    s,
    `${t.label} vers « ${zoneById(to)?.name ?? to} » (${minutes} min${pluie ? ", pluie oblige" : ""}${t.cost ? `, -${t.cost} F` : ""}).`,
    "info",
  );

  if (t.riskChance > 0 && rng() < t.riskChance) {
    if (mode === "gbaka") {
      const perte = Math.min(500, s.money);
      changeMoney(s, -perte);
      addLog(s, `${t.riskLabel} ${perte} F envolés. Gbaka, je t'ai eu… ou pas.`, "bad");
    } else {
      applyNeeds(s, { energie: -15, hygiene: -10 });
      addLog(s, `${t.riskLabel} Égratigné mais vivant.`, "bad");
    }
  }

  progressMissions(s);
  checkDeadlines(s);
  checkCollapse(s);
  return s;
}

// ————————————————————————————— Dialogues PNJ —————————————————————————————

export interface TalkResult {
  state: GameState;
  lines: string[];
  npcId: string;
}

export function talkTo(state: GameState, npcId: string): TalkResult {
  const npc = npcById(npcId);
  const s: GameState = structuredClone(state);
  if (!npc || npc.zone !== s.zone) return { state, lines: [], npcId };

  const lines: string[] = [npc.lines[s.day % npc.lines.length]];

  if (npc.offerMission) {
    const m = s.missions[npc.offerMission];
    const def = missionById(npc.offerMission);
    const unlocked =
      npc.offerMission === "m1" ||
      (npc.offerMission === "m2" && s.missions.m1.status === "done") ||
      (npc.offerMission === "m3" && s.missions.m2.status === "done");
    if (m.status === "locked" && unlocked && def) {
      m.status = "offered";
      lines.push(`Au fait… ${def.pitch} Ça te dit, môgô ? (Mission proposée : « ${def.title} »)`);
      addLog(s, `Nouvelle mission offerte par ${npc.name} : « ${def.title} ».`, "good");
    }
  }

  s.minute += 10;
  checkDeadlines(s);
  checkCollapse(s);
  return { state: s, lines, npcId };
}

// ————————————————————————————— Missions & événements —————————————————————————————

export function acceptMission(state: GameState, id: MissionId): GameState {
  const s: GameState = structuredClone(state);
  const m = s.missions[id];
  if (m.status !== "offered") return state;
  m.status = "active";
  m.step = 0;
  if (id === "m2") {
    const total = s.minute + 360; // 6 h de jeu
    if (total > 1560) m.deadline = { day: s.day + 1, minute: total - 1440 };
    else m.deadline = { day: s.day, minute: total };
    addLog(
      s,
      `M2 active ! Chrono lancé : livraison avant J${m.deadline.day} ${formatClock(m.deadline.minute)}.`,
      "info",
    );
  } else {
    addLog(s, `Mission « ${missionById(id)?.title ?? id} » acceptée. C'est parti !`, "good");
  }
  return s;
}

export function resolveEvent(state: GameState, choiceId: string): GameState {
  const ev = state.pendingEvent;
  if (!ev) return state;
  const choice = ev.choices.find((c) => c.id === choiceId);
  if (!choice) return state;

  const s: GameState = structuredClone(state);
  applyOutcome(s, choice.outcome);
  if (ev.id === "aideAdjoua") s.flags.aideToday = s.day;
  s.pendingEvent = null;
  checkDeadlines(s);
  return s;
}

/** Payout de tontine au réveil (appelé par dormir / closeDaySummary). */
function payoutTontine(s: GameState): void {
  if (s.tontine.member && s.tontine.payoutDay !== null && s.day >= s.tontine.payoutDay) {
    changeMoney(s, TONTINE_PAYOUT);
    s.tontine.member = false;
    s.tontine.payoutDay = null;
    s.flags.tontineDone = true;
    addLog(
      s,
      `TONTINE ! Maman Adjoua te tend ${TONTINE_PAYOUT} F : « Ton tour, môgô. Profite bien ! »`,
      "money",
    );
  }
}

/** Fermeture du résumé de jour → nouveau jour (06:00). */
export function closeDaySummary(state: GameState): GameState {
  const s: GameState = structuredClone(state);
  if (!s.pendingSummary) return s;

  if (s.flags.collapsed) {
    delete s.flags.collapsed;
    applyNeeds(s, { energie: 25, moral: -5, faim: -20, hygiene: -15 });
    addLog(s, `Jour ${s.day + 1} — Réveil dur : dormi dans la rue. Yako…`, "bad");
  } else {
    addLog(s, `Jour ${s.day + 1} — Nouveau soleil sur Yopougon. ${s.dayStats.earned > 0 ? `Hier : +${s.dayStats.earned} F.` : ""}`, "info");
  }

  s.day += 1;
  s.minute = 360;
  s.pendingSummary = false;
  s.dayStats = { earned: 0, spent: 0 };
  delete s.flags.pluie;
  delete s.flags.aideToday;
  payoutTontine(s);
  checkDeadlines(s);
  return s;
}

/** Réinitialisation d'un jour sans dormir (utile après écroulement forcé). */
export const DAY_END_MINUTE = 1560;
