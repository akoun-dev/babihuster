/**
 * Données métier d'Abidjan Hustle — Yopougon (Vertical Slice).
 * Acteur : shared (données consommées par le moteur et l'UI guest).
 * Équilibrage documenté — voir .ai/SPECS/FEATURE-001_SPEC.md §5.
 * Aucune logique de jeu ici (prédicats de condition uniquement).
 */

import type {
  ActionDef,
  GlossaryEntry,
  MissionDef,
  NpcDef,
  TransportDef,
  ZoneDef,
} from "./types";

/** Paliers d'XP des compétences (niveau = nb de paliers atteints + 1, max 5) */
export const XP_PALIERS = [0, 10, 25, 45, 70];

export const START_MONEY = 2000;
export const TONTINE_COTISATION = 2000;
export const TONTINE_PAYOUT = 10000;
export const TONTINE_DURATION_DAYS = 7;

export const ZONES: ZoneDef[] = [
  {
    id: "chambre",
    name: "Chambre de garçon",
    subtitle: "Chez Tantie Rose — Siporex",
    icon: "BedDouble",
    color: "#A89A82",
    description:
      "4 m², un lit-plancher et un ventilateur qui fait un bruit de Gbaka. C'est ici que tout commence, môgô.",
  },
  {
    id: "maquis",
    name: "Maquis « Chez Tantie Rose »",
    subtitle: "Le cœur de l'enjaillement",
    icon: "UtensilsCrossed",
    color: "#E8743C",
    description:
      "Odeur de braises, sono qui tape du Coupé-Décalé, table en plastique rouge. L'ambiance waô, non ?",
  },
  {
    id: "marche",
    name: "Marché de Yopougon",
    subtitle: "Négocier ou mourir",
    icon: "Store",
    color: "#A83232",
    description:
      "Bâches vertes, bruit, monde pakè. Ici, ton Tchatche vaut plus que ton argent.",
  },
  {
    id: "gare",
    name: "Gare routière",
    subtitle: "Porte vers le reste du pays",
    icon: "Bus",
    color: "#D9B96B",
    description:
      "Les Gbaka klaxonnent, les porteurs crient les destinations. Et les faux porteurs rôdent…",
  },
  {
    id: "carrefour",
    name: "Carrefour Siporex",
    subtitle: "Le poumon des djossi",
    icon: "TrafficCone",
    color: "#F37021",
    description:
      "Embouteillages pakè, motos Jakarta partout. Ici on trouve toujours un petit travail.",
  },
  {
    id: "terrain",
    name: "Terrain vague",
    subtitle: "Foot et coups de nuit",
    icon: "Volleyball",
    color: "#4A7C3A",
    description:
      "Poussière rouge, portiques en bois. Le jour : les go du quartier. La nuit : attention aux microbes !",
  },
];

export const TRANSPORTS: TransportDef[] = [
  {
    id: "pied",
    label: "À pied",
    icon: "Footprints",
    minutes: 25,
    cost: 0,
    energy: 6,
    riskChance: 0,
    riskLabel: "",
  },
  {
    id: "gbaka",
    label: "Gbaka",
    icon: "Bus",
    minutes: 12,
    cost: 100,
    energy: 2,
    riskChance: 0.06,
    riskLabel: "Unpickpocket s'est chargé ta poche…",
  },
  {
    id: "jakarta",
    label: "Moto Jakarta",
    icon: "Bike",
    minutes: 7,
    cost: 300,
    energy: 1,
    riskChance: 0.08,
    riskLabel: "Petit pivot sur le goudron ! Casse-vitesse…",
  },
];

export const ACTIONS: ActionDef[] = [
  // ————— CHAMBRE —————
  {
    id: "dormir",
    zone: "chambre",
    label: "Dormir",
    desc: "Récupérer jusqu'à demain 06:00. Sauvegarde automatique.",
    icon: "Moon",
    minutes: 0,
    cost: 0,
    noEvent: true,
  },
  {
    id: "doucher",
    zone: "chambre",
    label: "Prendre une douche",
    desc: "L'eau du quartier, souvent froide. Mais ça réveille !",
    icon: "ShowerHead",
    minutes: 20,
    cost: 0,
    needs: { hygiene: 35, energie: -3 },
  },
  {
    id: "mangerProvisions",
    zone: "chambre",
    label: "Manger ses provisions",
    desc: "Riz + huile + piment, préparé au réchaud. Gratuit et nourrissant.",
    icon: "CookingPot",
    minutes: 10,
    cost: 0,
    needs: { faim: 25, moral: -2 },
    condition: (s) =>
      s.inventory.provisions > 0 ? null : "Ton sac de provisions est vide, môgô.",
    special: "provisions",
  },
  {
    id: "rangerChambre",
    zone: "chambre",
    label: "Ranger la chambre",
    desc: "Balayer, plier le lit. La Tantie regarde ça de près…",
    icon: "Sparkles",
    minutes: 30,
    cost: 0,
    needs: { moral: 5, energie: -5 },
    xp: { systemeD: 1 },
  },

  // ————— MAQUIS —————
  {
    id: "mangerGarba",
    zone: "maquis",
    label: "Garba (attiéké-thon)",
    desc: "LE plat national. Huile + oignons + piment. Gnamankoudji !",
    icon: "Fish",
    minutes: 30,
    cost: 1000,
    needs: { faim: 40, moral: 5 },
  },
  {
    id: "mangerAttieke",
    zone: "maquis",
    label: "Attiéké poisson braisé",
    desc: "Le braisé de la Tantie, plus copieux. C'est pas gâté du tout !",
    icon: "Drumstick",
    minutes: 45,
    cost: 1500,
    needs: { faim: 55, moral: 10 },
  },
  {
    id: "boireBissap",
    zone: "maquis",
    label: "Jus de bissap",
    desc: "Frais, sucré, avec un peu de menthe.",
    icon: "CupSoda",
    minutes: 15,
    cost: 500,
    needs: { faim: 10, moral: 3 },
  },
  {
    id: "danser",
    zone: "maquis",
    label: "Danser (enjaillement)",
    desc: "Coupé-Décalé à fond. Le moral remonte à bloc.",
    icon: "Music",
    minutes: 120,
    cost: 500,
    needs: { moral: 15, energie: -15, hygiene: -10 },
    xp: { reseau: 2, endurance: 1 },
  },
  {
    id: "enjailler",
    zone: "maquis",
    label: "S'enjailler avec le gbonhi de Serge (2 000 F)",
    desc: "La soirée légendaire. Tenue exigée, hygiène exigée, cagnotte 2 000 F.",
    icon: "PartyPopper",
    minutes: 180,
    cost: 2000,
    needs: { moral: 20, energie: -20, hygiene: -10 },
    xp: { reseau: 10 },
    condition: (s) => {
      if (!s.inventory.tenueSoiree) return "Il te faut la tenue de soirée (marché, 2 500 F).";
      if (s.needs.hygiene < 40) return "Trop sale pour approcher Serge ! Douche d'abord (hygiène ≥ 40).";
      if (s.minute < 1200) return "L'enjaillement démarre après 20:00 seulement.";
      return null;
    },
  },
  {
    id: "parlerTantie",
    zone: "maquis",
    label: "Parler à Tantie Rose",
    desc: "Elle a toujours une rumeur ou un plat à offrir.",
    icon: "MessageCircle",
    minutes: 15,
    cost: 0,
    special: "talk",
    npcId: "tantie",
    noEvent: true,
  },
  {
    id: "parlerKarim",
    zone: "maquis",
    label: "Parler à Zantra Karim",
    desc: "Le rabatteur de la boîte. Il connaît pakè de monde.",
    icon: "MessageCircle",
    minutes: 15,
    cost: 0,
    special: "talk",
    npcId: "karim",
    noEvent: true,
  },

  // ————— MARCHÉ —————
  {
    id: "acheterMatelas",
    zone: "marche",
    label: "Acheter un matelas (3 000 F)",
    desc: "Indispensable pour bien dormir. Ton dos dira merci.",
    icon: "Bed",
    minutes: 20,
    cost: 3000,
    special: "matelas",
    condition: (s) => (s.inventory.matelas ? "Tu as déjà un matelas." : null),
  },
  {
    id: "acheterProvisions",
    zone: "marche",
    label: "Acheter des provisions (1 200 F)",
    desc: "Un sac de vivres pour tenir la semaine.",
    icon: "ShoppingBasket",
    minutes: 15,
    cost: 1200,
    negotiable: true,
    special: "provisions",
  },
  {
    id: "acheterTenue",
    zone: "marche",
    label: "Tenue de soirée (2 500 F)",
    desc: "Un beau chemise en pagne pour l'enjaillement.",
    icon: "Shirt",
    minutes: 30,
    cost: 2500,
    negotiable: true,
    special: "tenue",
    condition: (s) => (s.inventory.tenueSoiree ? "Tu as déjà ta tenue de banana." : null),
  },
  {
    id: "rejoindreTontine",
    zone: "marche",
    label: "Rejoindre la tontine (2 000 F)",
    desc: "Chez Maman Adjoua : on cotise, et à J+7 c'est toi le grand gagnant.",
    icon: "PiggyBank",
    minutes: 20,
    cost: TONTINE_COTISATION,
    special: "tontineJoin",
    condition: (s) =>
      s.tontine.member
        ? "Tu es déjà dans la tontine."
        : s.flags.tontineDone
          ? "Tu as déjà gagné ton tour. Laisse les autres, môgô."
          : s.missions.m1.status === "done"
            ? null
            : "Maman Adjoua ne te connaît pas assez encore.",
  },
  {
    id: "cotiserTontine",
    zone: "marche",
    label: "Cotiser (2 000 F)",
    desc: "La cotisation du jour. Le pot commun grossit…",
    icon: "Coins",
    minutes: 10,
    cost: TONTINE_COTISATION,
    special: "tontinePay",
    condition: (s) =>
      !s.tontine.member
        ? "Tu n'es pas membre de la tontine."
        : s.flags.lastTontineDay === s.day
          ? "Tu as déjà cotisé aujourd'hui."
          : null,
  },
  {
    id: "parlerAdjoua",
    zone: "marche",
    label: "Parler à Maman Adjoua",
    desc: "Reine du marché, présidente de la tontine.",
    icon: "MessageCircle",
    minutes: 10,
    cost: 0,
    special: "talk",
    npcId: "adjoua",
    noEvent: true,
  },
  {
    id: "jobPorteur",
    zone: "marche",
    label: "Djossi : porteur au marché",
    desc: "Porter des sacs toute la matinée. Dur, mais payé comptant.",
    icon: "Package",
    minutes: 240,
    cost: 0,
    money: 5000,
    needs: { energie: -35, faim: -20, hygiene: -10 },
    xp: { systemeD: 2, endurance: 1 },
    condition: (s) => (s.needs.energie >= 25 ? null : "Trop fatigué pour ce djossi. Mange et repose-toi."),
  },

  // ————— GARE —————
  {
    id: "parlerMomoh",
    zone: "gare",
    label: "Parler à Momoh",
    desc: "Le gars de la gare. Il t'a « aidé » le jour de ton arrivée…",
    icon: "MessageCircle",
    minutes: 10,
    cost: 0,
    special: "talk",
    npcId: "momoh",
    noEvent: true,
  },
  {
    id: "envoiVillage",
    zone: "gare",
    label: "Mandat pour le village (2 000 F)",
    desc: "Envoyer de l'argent à la famille. Le cœur est léger après ça.",
    icon: "SendToBack",
    minutes: 15,
    cost: 2000,
    needs: { moral: 15 },
    rep: 3,
    special: "envoiVillage",
  },
  {
    id: "guetterBoulot",
    zone: "gare",
    label: "Guetter les arriveurs",
    desc: "Observer, écouter, apprendre les coins à business.",
    icon: "Eye",
    minutes: 60,
    cost: 0,
    needs: { energie: -10, moral: 2 },
    xp: { reseau: 1, tchatche: 1 },
  },

  // ————— CARREFOUR —————
  {
    id: "jobVendeur",
    zone: "carrefour",
    label: "Djossi : vendeur d'eau",
    desc: "Seau sur la tête, glace qui fond. 3 heures de tchatche sous le soleil.",
    icon: "Droplets",
    minutes: 180,
    cost: 0,
    money: 2000,
    needs: { energie: -25, faim: -10 },
    xp: { tchatche: 2 },
    condition: (s) => (s.needs.energie >= 20 ? null : "Trop crevé pour courir après les voitures."),
  },
  {
    id: "jobChantier",
    zone: "carrefour",
    label: "Djossi : manœuvre chantier",
    desc: "Porter des parpaings sur le chantier de laTour B. Bien payé, rude.",
    icon: "HardHat",
    minutes: 300,
    cost: 0,
    money: 4000,
    needs: { energie: -40, faim: -15, hygiene: -15 },
    xp: { endurance: 2 },
    condition: (s) => (s.needs.energie >= 30 ? null : "Le chantier, c'est pas pour aujourd'hui. Repose-toi."),
  },
  {
    id: "gratterCarrefour",
    zone: "carrefour",
    label: "Gratter (Système D)",
    desc: "Petits services, raccompagnements, combines. Gain aléatoire.",
    icon: "Wrench",
    minutes: 120,
    cost: 0,
    money: 600,
    needs: { energie: -15 },
    xp: { tchatche: 1, systemeD: 1 },
  },

  // ————— TERRAIN —————
  {
    id: "jouerFoot",
    zone: "terrain",
    label: "Jouer au foot",
    desc: "Match de quartier sur la terre rouge. Sport et joie de vivre.",
    icon: "Volleyball",
    minutes: 90,
    cost: 0,
    needs: { moral: 15, energie: -20, faim: -10, hygiene: -15 },
    xp: { endurance: 2 },
  },
  {
    id: "faireGbonhi",
    zone: "terrain",
    label: "Traîner avec le gbonhi",
    desc: "Rigoler avec les gars du quartier. Ça fait du bien au moral.",
    icon: "Users",
    minutes: 60,
    cost: 0,
    needs: { moral: 10 },
    xp: { reseau: 1 },
  },
  {
    id: "parlerBibo",
    zone: "terrain",
    label: "Parler au petit Bibo",
    desc: "Il connaît tous les secrets du quartier.",
    icon: "MessageCircle",
    minutes: 10,
    cost: 0,
    special: "talk",
    npcId: "bibo",
    noEvent: true,
  },
];

export const NPCS: NpcDef[] = [
  {
    id: "momoh",
    name: "Momoh",
    zone: "gare",
    role: "Le faux porteur repenti",
    icon: "UserRound",
    lines: [
      "Eh môgô ! Souviens-toi : à Babi, si tu dors, tu te fais rogner. Ici on lève tôt !",
      "La gare, c'est l'école de la vie. Tout le monde cherche son djossi, toi aussi tu vas t'en sortir.",
    ],
    offerMission: "m1",
  },
  {
    id: "tantie",
    name: "Tantie Rose",
    zone: "maquis",
    role: "La maman du quartier",
    icon: "UserRound",
    lines: [
      "Mon fils ! Viens, l'attiéké est chaud. Et dis, tu as mangé depuis matin ?",
      "Ici à Yop, on vit ensemble. Si tu grattes pour les gens, les gens gratteront pour toi.",
    ],
    offerMission: "m2",
  },
  {
    id: "adjoua",
    name: "Maman Adjoua",
    zone: "marche",
    role: "Reine du marché · Tontine",
    icon: "UserRound",
    lines: [
      "La tontine, môgô, c'est l'argent des gens sérieux. Cotise bien, et à ton tour tu vas banana !",
      "Attention aux prix au marché, hein. Faut toujours discuter, jamais accepter le premier prix !",
    ],
  },
  {
    id: "karim",
    name: "Zantra Karim",
    zone: "maquis",
    role: "Rabatteur de boîte",
    icon: "UserRound",
    lines: [
      "Ce soir ça va être chaud ici ! Si tu as la tenue et la forme, l'enjaillement t'attend, môgô.",
      "Moi je connais tout Yop : les DJ, les vigiles, les gros bras. Le réseau, c'est la vie !",
    ],
    offerMission: "m3",
  },
  {
    id: "bibo",
    name: "Petit Bibo",
    zone: "terrain",
    role: "Espion du quartier",
    icon: "UserRound",
    lines: [
      "Grand ! Tu sais que la nuit, le terrain appartient aux microbes ? Fais attention à ton téléphone, hein !",
      "Quand il pleut, les Gbaka prennent trois fois plus de temps. Le temps, c'est l'argent à Babi !",
    ],
  },
  {
    id: "serge",
    name: "Grand Frère Serge",
    zone: "maquis",
    role: "Le parrain de Yop City",
    icon: "Crown",
    lines: [
      "Je te garde à l'œil, petit. Qui travaille bien, Serge le remarque. Bientôt, j'aurai du boulot pour toi…",
    ],
  },
];

export const MISSIONS: MissionDef[] = [
  {
    id: "m1",
    title: "L'arrivée au pays",
    giver: "Momoh",
    icon: "Flag",
    pitch:
      "Tu es arrivé à Babi avec 2 000 F en poche après l'arnaque du faux porteur. Trouve de quoi dormir correctement.",
    steps: [
      "Gagner assez pour un matelas (djossi au carrefour ou au marché)",
      "Acheter le matelas au marché (3 000 F)",
      "Dormir dans ta chambre de garçon",
    ],
    reward: "300 F de la Tantie · +5 Réputation · La tontine s'ouvre à toi",
  },
  {
    id: "m2",
    title: "La livraison de la honte",
    giver: "Tantie Rose",
    icon: "Bike",
    pitch:
      "La Tantie a vendu 5 attiékés à livrer en urgence. La pluie menace, le chrono tourne : 6 heures de jeu !",
    steps: [
      "Passer au marché récupérer les commandes",
      "Livrer au carrefour Siporex avant l'échéance",
    ],
    reward: "3 000 F · +10 Réputation",
  },
  {
    id: "m3",
    title: "L'enjaillement du siècle",
    giver: "Zantra Karim",
    icon: "PartyPopper",
    pitch:
      "Serge organise la soirée au maquis. Il te faut la tenue, la forme, et 2 000 F pour participer à la cagnotte.",
    steps: [
      "Acheter une tenue de soirée (2 500 F au marché)",
      "Être propre (hygiène ≥ 40) et riche (2 000 F)",
      "S'enjailler au maquis après 20:00",
    ],
    reward: "+20 Moral · +15 Réputation · Grand Frère Serge te remarque",
  },
];

export const GLOSSARY: GlossaryEntry[] = [
  { word: "Apprenti gbaka", def: "Assistant du conducteur d'un gbaka : il aide à organiser la montée et la descente des passagers et annonce les destinations." },
  { word: "Babi", def: "Abidjan. « Babi la belle », la ville qui bouge." },
  { word: "C'est gâté", def: "C'est foutu, la situation est perdue." },
  { word: "Cireur de chaussures", def: "Personne qui nettoie et fait briller les chaussures de ses clients, souvent dans les lieux passants." },
  { word: "Djassaman", def: "Nom de métier proposé pour une voie de progression du jeu ; sens précis et orthographe à confirmer avec des locuteurs ivoiriens." },
  { word: "Djossi", def: "Petit boulot, travail informel." },
  { word: "Enjaillement", def: "Fête, joie, ambiance exubérante." },
  { word: "Fôô", def: "Calme, tranquille, sans problème." },
  { word: "Gbaka", def: "Minibus de transport collectif populaire à Abidjan." },
  { word: "Gbê", def: "« Ça marche ! », d'accord, c'est validé." },
  { word: "Gnamankoudji", def: "Expression de satisfaction : « délicieux ! »" },
  { word: "Gbonhi", def: "Bande d'amis, groupe du quartier." },
  { word: "Gosser", def: "Se disputer, s'embrouiller." },
  { word: "La go", def: "La fille, la copine." },
  { word: "Livreur de boisson", def: "Personne qui transporte et livre des boissons aux commerces, maquis, événements ou particuliers." },
  { word: "Livreur de pain", def: "Personne qui distribue le pain aux boutiques, kiosques, restaurants ou clients." },
  { word: "Microbes", def: "Terme populaire désignant des groupes de jeunes délinquants ; à employer avec discernement dans les dialogues." },
  { word: "Môgô", def: "Pote, mec, frérot." },
  { word: "Pakè", def: "Beaucoup, en grande quantité." },
  { word: "Tantie bagage", def: "Personne qui propose de porter ou d'aider à transporter les bagages dans une gare ou un marché." },
  { word: "Tchen", def: "L'argent, le billet." },
  { word: "Wotro", def: "Nom de métier proposé pour une voie de progression du jeu ; sens précis et orthographe à confirmer avec des locuteurs ivoiriens." },
  { word: "Yako", def: "Expression de compassion : « courage pour la galère »." },
  { word: "Zantra", def: "Rabatteur qui attire les clients dans les maquis/boîtes." },
];

/** Textes d'intro (écran de création et dialogue d'ouverture) */
export const INTRO_TEXT =
  "Tu débarques à la gare de Yopougon avec 2 000 F en poche — le faux porteur a pris le reste. Ton rêve : percer à Babi. Chambre de garçon, djossi, tontine, enjaillement… À toi de jouer, môgô. On a mis le pays !";

export const OUTFITS: Array<{ id: "pagne" | "streetwear" | "costard"; label: string; desc: string; color: string }> = [
  { id: "pagne", label: "Pagne wax", desc: "Authentique et coloré. Le quartier te respecte.", color: "#B5451B" },
  { id: "streetwear", label: "Streetwear", desc: "Casquette + basket. Style de Yop City.", color: "#F4B942" },
  { id: "costard", label: "Chemise costard", desc: "Pour viser le Plateau… un jour.", color: "#2D6A4F" },
];
