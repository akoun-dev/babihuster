/**
 * Avatar du joueur v2 — T-024, FEATURE-004 « Personnage AAA ».
 *
 * Pleine silhouette semi-réaliste en SVG pur (viewBox 240×424, ratio ~8 têtes),
 * dessinée à partir des choix de personnalisation : coiffure (`hair`), barbe
 * (`beard`), tenue (`outfit`), teinte de peau (`skin`) + expression (`mood`).
 * Conforme au master prompt : proportions crédibles, visage avec personnalité
 * (yeux à reflets, sourcils expressifs), matières en gradients (denim, cuir,
 * tissu), accessoires (sacoche usée, chaîne or, montre, écouteur) et tenues
 * qui évoluent par palier (debutant < streetwear < bomber < costard).
 *
 * Cadrages : `full` (silhouette entière, écran de création) ou `portrait`
 * (tête/épaules, HUD). Les ids de gradients sont déterministes (`pg-skin-…`),
 * fonction des seules props — deux instances de mêmes props partagent des
 * définitions identiques, donc sans conflit.
 *
 * Renvoi : FEATURE-004 (T-024). Composant 100 % présentationnel (pas de hooks,
 * pas de "use client"). Source de vérité des couleurs : data.ts.
 */

import type { BeardId, HairId, MoodId, Outfit, SkinId } from "@/lib/game/types";
import { HAIRSTYLES, OUTFITS, SKIN_TONES } from "@/lib/game/data";

/** Libellé accessible par défaut du portrait. */
const LIBELLE_DEFAUT = "Portrait de ton personnage";

/** Encre sombre (yeux, sourcils, cils). */
const ENCRE = "#1A1410";

/** Or du thème (chaîne, perles, montre). */
const OR = "#F4B942";

/** Blanc cassé des dents / scléra. */
const IVOIRE = "#F1E7D6";

/** Bouche (intérieur). */
const BOUCHE = "#4A2117";

// ————— Manipulation de couleurs (shading automatique par teinte) —————

function hexVersRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbVersHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Éclaircit (pct > 0) ou assombrit (pct < 0) une couleur hex. */
function nuance(hex: string, pct: number): string {
  const [r, g, b] = hexVersRgb(hex);
  const f = (n: number) => (pct >= 0 ? n + (255 - n) * pct : n * (1 + pct));
  return rgbVersHex(f(r), f(g), f(b));
}

// ————— Lookup maps (source de vérité : data.ts) —————

const COULEURS_CHEVEUX = Object.fromEntries(
  HAIRSTYLES.map((h) => [h.id, h.color] as const),
) as Record<HairId, string>;

const COULEURS_PEAU = Object.fromEntries(
  SKIN_TONES.map((s) => [s.id, s.color] as const),
) as Record<SkinId, string>;

const COULEURS_TENUES = Object.fromEntries(
  OUTFITS.map((o) => [o.id, o.color] as const),
) as Record<Outfit, string>;

export interface AvatarProps {
  hair: HairId;
  outfit: Outfit;
  skin: SkinId;
  /** Barbe (T-024). Défaut : aucune. */
  beard?: BeardId;
  /** Expression du visage (T-024). Défaut : neutre. */
  mood?: MoodId;
  /** Cadrage : "full" = silhouette entière (défaut) ; "portrait" = tête/épaules (HUD). */
  framing?: "full" | "portrait";
  /** Taille rendue : le composant remplit son conteneur (w-full h-auto). */
  className?: string;
  /** Libellé accessible du SVG (role="img"). */
  label?: string;
}

// ————————————————————————————— Géométrie —————————————————————————————

/** Crâne + mâchoire (menton défini). */
const TETE =
  "M 102 47 Q 102 27 120 25 Q 138 27 138 47 Q 137 59 129 67 Q 124.5 71.5 120 72 Q 115.5 71.5 111 67 Q 103 59 102 47 Z";

/** Cou. */
const COU =
  "M 113.6 69 L 113.6 79.5 Q 120 84 126.4 79.5 L 126.4 69 Q 120 73.5 113.6 69 Z";

/** Ombre de mâchoire (creusant le bas du visage). */
const OMBRE_MACHOIRE =
  "M 106 55 Q 108.5 66 120 70.5 Q 131.5 66 134 55 Q 128 66.5 120 67 Q 112 66.5 106 55 Z";

/** Bassin (haut du pantalon). */
const BASSIN =
  "M 93 170 L 147 170 Q 149.5 186 146.5 203 Q 120 211 93.5 203 Q 90.5 186 93 170 Z";

/** Jambes (peau sous le short de tee? non — pantalon par défaut, remplacées par tenue). */
const JAMBE_G = "M 96 200 Q 107 205 117 200 L 114 380 Q 105.5 384.5 98.5 380 Z";
const JAMBE_D = "M 123 200 Q 133 205 143 200 L 141.5 380 Q 134.5 384.5 126 380 Z";

/** Bras nus (tee débutant) — gauche puis droite. */
const BRAS_G =
  "M 95 102 Q 87.5 110 87 124 L 89 170 Q 90.5 200 93 222 L 104.5 220 Q 101.5 186 101 160 Q 100.5 132 103.5 110 Q 100 104 95 102 Z";
const BRAS_D =
  "M 145 102 Q 152.5 110 153 124 L 151 170 Q 149.5 200 147 222 L 135.5 220 Q 138.5 186 139 160 Q 139.5 132 136.5 110 Q 140 104 145 102 Z";
const MAIN_G = "M 93 222 Q 90.5 232 94.5 237 Q 99.5 238.5 102 233.5 Q 104 227 104.5 220.5 Z";
const MAIN_D = "M 147 222 Q 149.5 232 145.5 237 Q 140.5 238.5 138 233.5 Q 136 227 135.5 220.5 Z";

/** Manche longue (hoodie/bomber/blazer) — gauche. */
const MANCHE_G =
  "M 95 101 Q 87 110 86.8 126 L 89.2 172 Q 90.5 200 92.8 220 L 105.5 218 Q 102 184 101.3 158 Q 100.8 130 104.3 108 Q 100 104 95 101 Z";
/** Manche droite (miroir). */
const MANCHE_D =
  "M 145 101 Q 153 110 153.2 126 L 150.8 172 Q 149.5 200 147.2 220 L 134.5 218 Q 138 184 138.7 158 Q 139.2 130 135.7 108 Q 140 104 145 101 Z";

/** Manche courte (tee) — gauche. */
const MANCHE_COURTE_G =
  "M 94 100 Q 86 108 86.5 127 L 103.5 125 Q 103 112 104.5 104 Q 100.5 100.5 94 100 Z";
const MANCHE_COURTE_D =
  "M 146 100 Q 154 108 153.5 127 L 136.5 125 Q 137 112 135.5 104 Q 139.5 100.5 146 100 Z";

/** Torsos par tenue (épaules → ourlet). */
const TORSE_TEE =
  "M 90 106 Q 94.5 91 111 85.5 L 114 83 Q 120 87.5 126 83 L 129 85.5 Q 145.5 91 150 106 Q 154 130 149.5 155 L 148 177 Q 120 185.5 92 177 L 90.5 155 Q 86 130 90 106 Z";
const TORSE_HOODIE =
  "M 88.5 106 Q 93.5 90 110.5 84.5 L 114 82.5 Q 120 86.5 126 82.5 L 129.5 84.5 Q 146.5 90 151.5 106 Q 155.5 130 151 155 L 149.5 178 Q 120 186.5 90.5 178 L 89 155 Q 84.5 130 88.5 106 Z";
const TORSE_BOMBER =
  "M 87 106 Q 92 89.5 110 84 L 114 82 Q 120 86 126 82 L 130 84 Q 148 89.5 153 106 Q 156.5 131 152 156 L 150.5 179 Q 120 188 89.5 179 L 88 156 Q 83.5 131 87 106 Z";

/** Capuche derrière la nuque (streetwear). */
const CAPUCHE =
  "M 97 98 Q 103 76 120 74.5 Q 137 76 143 98 Q 131 89 120 89 Q 109 89 97 98 Z";

/** Panneau de tee blanc sous le bomber / la chemise du blazer. */
const TEE_BLANC =
  "M 111.5 88.5 Q 120 94.5 128.5 88.5 L 129.5 126 Q 120 131 110.5 126 Z";

// ————— Cheveux : formes —————

/** Casque court (coupe / tresses). */
const CASQUE =
  "M 101.5 48 Q 101 26.5 120 25 Q 139 26.5 138.5 48 Q 133 34 120 33.5 Q 107 34 101.5 48 Z";

/** Dégradé : sommets légèrement plus hauts (la matière monte au-dessus du crâne). */
const CASQUE_DEGRADE =
  "M 101.5 46 Q 100.5 25 120 23.5 Q 139.5 25 138.5 46 Q 133 32.5 120 32 Q 107 32.5 101.5 46 Z";

/** Crâne rasé : voile d'ombre très court. */
const RASE_OMBRE =
  "M 104.5 40 Q 106 29.5 120 27.5 Q 134 29.5 135.5 40 Q 127 33.5 120 33 Q 113 33.5 104.5 40 Z";

/** Bandes de fondu du dégradé (tempe gauche, opacité croissante vers la nuque). */
const BANDES_DEGRADE_G = [
  "M 101.8 36 L 104.8 36 L 104.2 50 L 102 50 Z",
  "M 104.9 36 L 107.4 36 L 106.8 50 L 104.4 50 Z",
  "M 107.6 36 L 110 36 L 109.4 49 L 107.2 49 Z",
];
const BANDES_DEGRADE_D = [
  "M 138.2 36 L 135.2 36 L 135.8 50 L 138 50 Z",
  "M 135.1 36 L 132.6 36 L 133.2 50 L 135.6 50 Z",
  "M 132.4 36 L 130 36 L 130.6 49 L 132.8 49 Z",
];

/** Dreads : 6 grosses mèches tombant sur les épaules (couche arrière). */
const MECHEES_DREADS = [
  "M 104 32 Q 96 44 94 62",
  "M 100 38 Q 90 54 88 76",
  "M 97 46 Q 88 66 87 92",
  "M 136 32 Q 144 44 146 62",
  "M 140 38 Q 150 54 152 76",
  "M 143 46 Q 152 66 153 92",
];
const MECHEES_DREADS_OMBRE = [
  "M 100 38 Q 90 54 88 76",
  "M 97 46 Q 88 66 87 92",
  "M 140 38 Q 150 54 152 76",
  "M 143 46 Q 152 66 153 92",
];

/** Afro : bourrelets autour du crâne (couche arrière). */
const BOULES_AFRO: Array<[number, number, number]> = [
  [89, 42, 10],
  [96, 28, 11],
  [108, 18, 12],
  [132, 18, 12],
  [144, 28, 11],
  [151, 42, 10],
  [86, 56, 8],
  [154, 56, 8],
];

/** Afro : arcs de texture. */
const TEXTURES_AFRO = [
  "M 92 26 Q 104 12 120 10",
  "M 120 10 Q 136 12 148 26",
  "M 88 40 Q 96 24 112 16",
  "M 152 40 Q 144 24 128 16",
];

/** Tresses : 5 raies cornrows sur le casque. */
const RAIES_TRESSES = [
  "M 120 33.5 L 120 25.5",
  "M 113 34 Q 111 29 109.5 26.5",
  "M 127 34 Q 129 29 130.5 26.5",
  "M 107 36 Q 103.5 31 101.5 29",
  "M 133 36 Q 136.5 31 138.5 29",
];

/** Tresses : nattes latérales plaquées (2 par côté). */
const NATTES_TRESSES = [
  "M 103 44 Q 95 56 93 74",
  "M 106 46 Q 99 58 97.5 78",
  "M 137 44 Q 145 56 147 74",
  "M 134 46 Q 141 58 142.5 78",
];

/** Perles dorées au bout des nattes. */
const PERLES_TRESSES: Array<[number, number]> = [
  [93.4, 77.5],
  [97.9, 81.5],
  [146.6, 77.5],
  [142.1, 81.5],
];

// ————— Barbes —————

const MOUSTACHE =
  "M 114.6 58.8 Q 120 57.3 125.4 58.8 Q 122.7 60.4 120 60.1 Q 117.3 60.4 114.6 58.8 Z";

const BOUC =
  "M 115.4 66.2 Q 120 64.6 124.6 66.2 Q 123.6 70.8 120 71.2 Q 116.4 70.8 115.4 66.2 Z";

/** Barbe courte : bande suivant la mâchoire. */
const BARBE =
  "M 103.8 50 Q 105.5 62.5 113.5 68.6 Q 117 71.4 120 71.8 Q 123 71.4 126.5 68.6 Q 134.5 62.5 136.2 50 Q 136.8 63.5 127 70.2 Q 123.4 72.6 120 72.6 Q 116.6 72.6 113 70.2 Q 103.2 63.5 103.8 50 Z";

// ————————————————————————————— Visage —————————————————————————————

/** Sourcils par humeur (gauche, droite) — traits ENCRE. */
const SOURCILS: Record<MoodId, [string, string]> = {
  neutre: [
    "M 107.4 43.2 Q 111.5 40.9 115.6 42.8",
    "M 132.6 43.2 Q 128.5 40.9 124.4 42.8",
  ],
  heureux: [
    "M 107.4 42 Q 111.5 39.6 115.6 41.6",
    "M 132.6 42 Q 128.5 39.6 124.4 41.6",
  ],
  determine: [
    "M 107.2 42.6 Q 111.5 41.3 116 43.6",
    "M 132.8 42.6 Q 128.5 41.3 124 43.6",
  ],
  surpris: [
    "M 107.6 40.8 Q 111.5 38.8 115.4 40.8",
    "M 132.4 40.8 Q 128.5 38.8 124.6 40.8",
  ],
  contrarie: [
    "M 107.4 44.2 Q 111.5 42.4 115.8 41.6",
    "M 132.6 44.2 Q 128.5 42.4 124.2 41.6",
  ],
};

/** Œil : (scléra, iris r) par humeur — centres à (111.5|128.5, 48). */
const OEILS: Record<MoodId, { scleraG: string; scleraD: string; irisR: number }> = {
  neutre: {
    scleraG: "M 107.6 48 Q 111.5 45.9 115.4 48 Q 111.5 50.3 107.6 48 Z",
    scleraD: "M 124.6 48 Q 128.5 45.9 132.4 48 Q 128.5 50.3 124.6 48 Z",
    irisR: 1.5,
  },
  heureux: {
    scleraG: "M 107.8 48 Q 111.5 46.2 115.2 48 Q 111.5 49.9 107.8 48 Z",
    scleraD: "M 124.8 48 Q 128.5 46.2 132.2 48 Q 128.5 49.9 124.8 48 Z",
    irisR: 1.35,
  },
  determine: {
    scleraG: "M 107.6 48 Q 111.5 46.1 115.4 48 Q 111.5 50.1 107.6 48 Z",
    scleraD: "M 124.6 48 Q 128.5 46.1 132.4 48 Q 128.5 50.1 124.6 48 Z",
    irisR: 1.4,
  },
  surpris: {
    scleraG: "M 107.2 48 Q 111.5 44.6 115.8 48 Q 111.5 51.4 107.2 48 Z",
    scleraD: "M 124.2 48 Q 128.5 44.6 132.8 48 Q 128.5 51.4 124.2 48 Z",
    irisR: 1.3,
  },
  contrarie: {
    scleraG: "M 107.6 48.2 Q 111.5 46.4 115.4 48.2 Q 111.5 50.2 107.6 48.2 Z",
    scleraD: "M 124.6 48.2 Q 128.5 46.4 132.4 48.2 Q 128.5 50.2 124.6 48.2 Z",
    irisR: 1.4,
  },
};

/** Bouche par humeur — renvoie les éléments SVG (traits + remplissages). */
function Bouche({ mood, peau }: { mood: MoodId; peau: string }) {
  const trait = nuance(peau, -0.55);
  switch (mood) {
    case "heureux":
      return (
        <g aria-hidden="true">
          <path
            d="M 112.4 60.6 Q 120 68.8 127.6 60.6 Q 120 63.4 112.4 60.6 Z"
            fill={BOUCHE}
          />
          <path
            d="M 113.6 61.2 Q 120 63.2 126.4 61.2 L 125.8 62.8 Q 120 64.4 114.2 62.8 Z"
            fill="#F7F1E4"
          />
        </g>
      );
    case "surpris":
      return (
        <g aria-hidden="true">
          <ellipse cx="120" cy="62.6" rx="3.2" ry="4.1" fill={BOUCHE} />
          <ellipse cx="120" cy="64.8" rx="1.8" ry="1.2" fill="#7A4034" opacity="0.8" />
        </g>
      );
    case "determine":
      return (
        <path
          d="M 113.8 61.9 Q 120 61.3 126.2 61.9"
          fill="none"
          stroke={trait}
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      );
    case "contrarie":
      return (
        <g aria-hidden="true">
          <path
            d="M 113 63.6 Q 119.8 59.8 126.4 63.4"
            fill="none"
            stroke={trait}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M 117 66.8 Q 120 68 123 66.8"
            fill="none"
            stroke={trait}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.35"
          />
        </g>
      );
    default:
      // neutre : léger sourire confiant
      return (
        <g aria-hidden="true">
          <path
            d="M 113 61.8 Q 119.8 64.8 126.4 60.8"
            fill="none"
            stroke={trait}
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M 116.5 64.6 Q 120 65.8 123.5 64.2"
            fill="none"
            stroke={trait}
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.3"
          />
        </g>
      );
  }
}

/** Barbe par option. */
function Barbe({ beard }: { beard: BeardId }) {
  if (beard === "aucune") return null;
  const couleur = "#221812";
  return (
    <g aria-hidden="true" fill={couleur}>
      {(beard === "moustache" || beard === "bouc" || beard === "barbe") && (
        <path d={MOUSTACHE} />
      )}
      {beard === "bouc" && (
        <>
          <path d={BOUC} />
          <path
            d="M 116 61 L 116.6 64.4 M 124 61 L 123.4 64.4"
            fill="none"
            stroke={couleur}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      )}
      {beard === "barbe" && (
        <>
          <path d={BARBE} />
          <path d={BOUC} opacity="0.85" />
          <path
            d="M 104.8 50 Q 106 58 110 63 M 135.2 50 Q 134 58 130 63"
            fill="none"
            stroke={couleur}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </>
      )}
    </g>
  );
}

/** Yeux + sourcils + nez + bouche + barbe, selon l'humeur. */
function Visage({ mood, skin, beard }: { mood: MoodId; skin: SkinId; beard: BeardId }) {
  const peau = COULEURS_PEAU[skin];
  const oeil = OEILS[mood];
  const [sourcilG, sourcilD] = SOURCILS[mood];
  const ombreNez = nuance(peau, -0.4);

  return (
    <g aria-hidden="true">
      {/* ombre de mâchoire + lumières (volume du visage) */}
      <path d={OMBRE_MACHOIRE} fill={nuance(peau, -0.3)} opacity="0.25" />
      <ellipse cx="113" cy="36" rx="6.5" ry="3.6" fill="#FFFFFF" opacity="0.13" transform="rotate(-10 113 36)" />
      <ellipse cx="130.5" cy="55.5" rx="3.4" ry="6" fill="#FFFFFF" opacity="0.12" transform="rotate(-12 130.5 55.5)" />

      {/* sourcils */}
      <path d={sourcilG} fill="none" stroke={ENCRE} strokeWidth="2.1" strokeLinecap="round" />
      <path d={sourcilD} fill="none" stroke={ENCRE} strokeWidth="2.1" strokeLinecap="round" />
      {mood === "determine" && (
        <path
          d="M 118.2 40.2 L 117.4 43.2 M 121.8 40.2 L 122.6 43.2"
          fill="none"
          stroke={ENCRE}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.35"
        />
      )}

      {/* œil gauche */}
      <path d={oeil.scleraG} fill={IVOIRE} />
      <circle cx="111.5" cy="48" r={oeil.irisR} fill="#3A2415" />
      <circle cx="111.5" cy="48" r="0.7" fill={ENCRE} />
      <circle cx="112.1" cy="47.5" r="0.45" fill="#FFFFFF" opacity="0.95" />
      <path
        d="M 107.2 47.9 Q 111.5 45.3 115.8 47.9"
        fill="none"
        stroke={ENCRE}
        strokeWidth="1.05"
        strokeLinecap="round"
      />

      {/* œil droit */}
      <path d={oeil.scleraD} fill={IVOIRE} />
      <circle cx="128.5" cy="48" r={oeil.irisR} fill="#3A2415" />
      <circle cx="128.5" cy="48" r="0.7" fill={ENCRE} />
      <circle cx="129.1" cy="47.5" r="0.45" fill="#FFFFFF" opacity="0.95" />
      <path
        d="M 124.2 47.9 Q 128.5 45.3 132.8 47.9"
        fill="none"
        stroke={ENCRE}
        strokeWidth="1.05"
        strokeLinecap="round"
      />

      {/* nez */}
      <path
        d="M 120 47 Q 121.2 51.5 122.5 55 Q 121.3 56.8 118.9 56.4"
        fill="none"
        stroke={ombreNez}
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="117.3" cy="56.3" r="0.75" fill={nuance(peau, -0.5)} opacity="0.55" />
      <circle cx="122.7" cy="56.3" r="0.75" fill={nuance(peau, -0.5)} opacity="0.55" />
      <ellipse cx="120" cy="54.2" rx="1.8" ry="1.2" fill="#FFFFFF" opacity="0.3" />

      {/* bouche */}
      <Bouche mood={mood} peau={peau} />

      {/* barbe */}
      <Barbe beard={beard} />
    </g>
  );
}

// ————————————————————————————— Cheveux —————————————————————————————

/** Couches cheveux DERRIÈRE la tête (afro, dreads). */
function CheveuxArriere({ hair, couleur }: { hair: HairId; couleur: string }) {
  if (hair === "afro") {
    return (
      <g aria-hidden="true">
        <circle cx="120" cy="40" r="35" fill={`url(#pg-hair-${hair})`} />
        {BOULES_AFRO.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={couleur} />
        ))}
        {TEXTURES_AFRO.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="#000000"
            strokeOpacity="0.18"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  }
  if (hair === "dreads") {
    return (
      <g aria-hidden="true" fill="none" strokeLinecap="round">
        {MECHEES_DREADS.map((d) => (
          <path key={d} d={d} stroke={couleur} strokeWidth="6" />
        ))}
        {MECHEES_DREADS_OMBRE.map((d) => (
          <path key={d} d={d} stroke="#000000" strokeOpacity="0.3" strokeWidth="2" />
        ))}
      </g>
    );
  }
  return null;
}

/** Couches cheveux DEVANT la tête (rase, coupe, dégradé, tresses). */
function CheveuxAvant({ hair, couleur }: { hair: HairId; couleur: string }) {
  if (hair === "afro") return null;

  return (
    <g aria-hidden="true">
      {hair === "rase" ? (
        <path d={RASE_OMBRE} fill={couleur} opacity="0.32" />
      ) : (
        <path
          d={hair === "degrade" ? CASQUE_DEGRADE : CASQUE}
          fill={`url(#pg-hair-${hair})`}
        />
      )}

      {hair === "degrade" &&
        [...BANDES_DEGRADE_G, ...BANDES_DEGRADE_D].map((d, i) => (
          <path
            key={d}
            d={d}
            fill={couleur}
            opacity={i < 3 ? [0.25, 0.45, 0.7][i] : [0.7, 0.45, 0.25][i - 3]}
          />
        ))}

      {hair === "coupe" && (
        <>
          {/* raccords tempes */}
          <path d="M 102.5 45 L 106.5 44.5 L 104.5 51.5 Z" fill={couleur} />
          <path d="M 137.5 45 L 133.5 44.5 L 135.5 51.5 Z" fill={couleur} />
        </>
      )}

      {hair === "tresses" && (
        <>
          {RAIES_TRESSES.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="#000000"
              strokeOpacity="0.45"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          ))}
          {NATTES_TRESSES.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={couleur}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          ))}
          {PERLES_TRESSES.map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="1.5"
              fill={OR}
              stroke="#000000"
              strokeOpacity="0.25"
              strokeWidth="0.5"
            />
          ))}
        </>
      )}
    </g>
  );
}

// ————————————————————————————— Tenues —————————————————————————————

/** Jambes en jean ou en tissu habillé + surpiqûres + (déchirures bomber). */
function Jambes({ outfit, peau }: { outfit: Outfit; peau: string }) {
  const jean = outfit !== "costard";
  const fill = jean ? "url(#pg-jean)" : "url(#pg-trousers)";
  const seam = "#1C2836";

  return (
    <g aria-hidden="true">
      <path d={BASSIN} fill={fill} />
      <path d={JAMBE_G} fill={fill} />
      <path d={JAMBE_D} fill={fill} />
      {/* braguette + poches + surpiqûres */}
      <path
        d="M 120 205 L 120 218 M 96 176 Q 103 184 110 178 M 144 176 Q 137 184 130 178"
        fill="none"
        stroke={seam}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M 96.5 202 L 99 376 M 143.5 202 L 141 376"
        fill="none"
        stroke={seam}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* plis de genoux */}
      <path
        d="M 100 290 Q 106 293 112 290 M 128 290 Q 134 293 140 290"
        fill="none"
        stroke="#000000"
        strokeOpacity="0.18"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* déchirures (bomber premium, jean délavé) */}
      {outfit === "bomber" && (
        <>
          <path
            d="M 100.5 287 Q 106 283.5 111.5 287 Q 112.5 295.5 106 298.5 Q 99.5 295.5 100.5 287 Z"
            fill={peau}
          />
          <path
            d="M 100.5 287 Q 106 283.5 111.5 287 Q 112.5 295.5 106 298.5 Q 99.5 295.5 100.5 287 Z"
            fill="none"
            stroke="#10151C"
            strokeWidth="1.1"
            opacity="0.6"
          />
          <path
            d="M 101.5 290 L 103.5 293 M 105 286.5 L 106.5 290 M 108 289 L 109.5 293"
            fill="none"
            stroke="#D8D2C4"
            strokeWidth="0.8"
            opacity="0.85"
          />
          <path
            d="M 129.5 243 Q 134 240.5 138.5 243 Q 139.2 249.5 134 251.5 Q 128.8 249.5 129.5 243 Z"
            fill={peau}
            stroke="#10151C"
            strokeWidth="1"
            strokeOpacity="0.55"
          />
          <path
            d="M 130.5 246 L 132.5 248.5 M 134.5 243.5 L 136 247"
            fill="none"
            stroke="#D8D2C4"
            strokeWidth="0.8"
            opacity="0.85"
          />
        </>
      )}
    </g>
  );
}

/** Chaussures par tenue. */
function Chaussures({ outfit }: { outfit: Outfit }) {
  if (outfit === "bomber") {
    // Boots à lacets
    return (
      <g aria-hidden="true">
        {[false, true].map((droite) => {
          const m = droite ? " scale(-1 1) translate(-240 0)" : "";
          return (
            <g key={String(droite)} transform={`translate(0 0)${m}`}>
              <path d="M 99 356 L 113.5 356 L 114.2 382 L 98.3 382 Z" fill="url(#pg-boot)" />
              <path
                d="M 98.5 380 L 113.5 380 Q 116.5 388 115 394.5 Q 114.5 398 108 398 L 103 398 Q 96.5 398 96.5 392 Q 96.5 386 98.5 380 Z"
                fill="url(#pg-boot)"
              />
              <path
                d="M 96.5 392 L 115.3 392 L 115 395.5 Q 114.5 398.5 108 398.5 L 103 398.5 Q 96.5 398.5 96.5 395 Z"
                fill="#0B0906"
              />
              <path
                d="M 100.5 361 L 112.5 363 M 100.5 366 L 112.5 368 M 100.5 371 L 112.5 373"
                fill="none"
                stroke="#5A534A"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>
    );
  }
  if (outfit === "costard") {
    // Mocassins en cuir
    return (
      <g aria-hidden="true">
        {[false, true].map((droite) => {
          const m = droite ? " scale(-1 1) translate(-240 0)" : "";
          return (
            <g key={String(droite)} transform={`translate(0 0)${m}`}>
              <path
                d="M 98.5 380 L 113.5 380 Q 117 388 115 393.5 Q 114.5 397 108 397 L 103 397 Q 96.5 397 96.5 391.5 Q 96.5 385.5 98.5 380 Z"
                fill="url(#pg-boot)"
              />
              <path
                d="M 99.5 385 Q 106 383.5 112.5 385"
                fill="none"
                stroke="#4E463C"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M 96.5 391.5 L 115.2 391.5 L 115 394 Q 114.5 397 108 397 L 103 397 Q 96.5 397 96.5 394 Z"
                fill="#0B0906"
              />
            </g>
          );
        })}
      </g>
    );
  }
  // Baskets (debutant / streetwear)
  const neuve = outfit === "streetwear";
  return (
    <g aria-hidden="true">
      {[false, true].map((droite) => {
        const m = droite ? " scale(-1 1) translate(-240 0)" : "";
        return (
          <g key={String(droite)} transform={`translate(0 0)${m}`}>
            <path
              d="M 98.5 380 L 113.5 380 Q 116.5 388 115 394.5 Q 114.5 398 108 398 L 103 398 Q 96.5 398 96.5 392 Q 96.5 386 98.5 380 Z"
              fill={neuve ? "url(#pg-shoe)" : "#CFC8B8"}
            />
            <path
              d="M 96.5 392 L 115.3 392 L 115 395 Q 114.5 398 108 398 L 103 398 Q 96.5 398 96.5 394.5 Z"
              fill={neuve ? "#B7AFA0" : "#A39A87"}
            />
            <path
              d="M 101 383.5 L 110 386 M 101 387.5 L 110 390.5"
              fill="none"
              stroke={neuve ? "#8E8677" : "#7E7666"}
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}

/** Bras (manches selon tenue) + mains + montre (bomber). */
function Bras({ outfit, peau }: { outfit: Outfit; peau: string }) {
  const manchesLongues = outfit !== "debutant";
  // Le bomber a son propre gradient charbon (les manches = la veste, même matière que le torse).
  const etoffe = outfit === "bomber" ? "url(#pg-bomber)" : `url(#pg-cloth-${outfit})`;
  const etoffeFonce =
    outfit === "bomber" ? "#1C1C1A" : nuance(COULEURS_TENUES[outfit], -0.28);

  return (
    <g aria-hidden="true">
      {/* peau des bras (visible sous manches courtes uniquement, mais dessinée toujours) */}
      {!manchesLongues && (
        <>
          <path d={BRAS_G} fill={peau} />
          <path d={BRAS_D} fill={peau} />
        </>
      )}
      {/* manches */}
      {manchesLongues ? (
        <>
          <path d={MANCHE_G} fill={etoffe} />
          <path d={MANCHE_D} fill={etoffe} />
          {/* bordures de poignets */}
          <path d="M 92.6 213 L 105.3 211 L 105.6 220 L 92.9 222 Z" fill={etoffeFonce} />
          <path d="M 147.4 213 L 134.7 211 L 134.4 220 L 147.1 222 Z" fill={etoffeFonce} />
        </>
      ) : (
        <>
          <path d={MANCHE_COURTE_G} fill={etoffe} />
          <path d={MANCHE_COURTE_D} fill={etoffe} />
        </>
      )}
      {/* mains */}
      <path d={MAIN_G} fill={peau} />
      <path d={MAIN_D} fill={peau} />
      {/* montre (bomber) */}
      {outfit === "bomber" && (
        <>
          <path d="M 91.5 211.5 L 104.5 209.5 L 105.3 215.5 L 92.3 217.5 Z" fill="#241F1A" />
          <circle cx="98.6" cy="213.9" r="2" fill={OR} />
          <circle cx="98.6" cy="213.9" r="1.1" fill="#241F1A" />
        </>
      )}
    </g>
  );
}

/** Torse + détails (col, zip, chaîne, capuche, poches, revers) + sacoche. */
function Torse({ outfit, peau }: { outfit: Outfit; peau: string }) {
  const couleur = COULEURS_TENUES[outfit];
  const etoffe = `url(#pg-cloth-${outfit})`;
  const fonce = nuance(couleur, -0.28);

  if (outfit === "debutant") {
    return (
      <g aria-hidden="true">
        <path d={TORSE_TEE} fill={etoffe} />
        {/* col rond */}
        <path
          d="M 113 85 Q 120 89.5 127 85"
          fill="none"
          stroke={fonce}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* plis du tissu */}
        <path
          d="M 104 118 Q 106 140 104 162 M 136 118 Q 134 140 136 162"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* ourlet */}
        <path
          d="M 92.5 172.5 L 147.5 172.5"
          fill="none"
          stroke={fonce}
          strokeWidth="1.4"
          opacity="0.8"
        />
        {/* sacoche bandoulière usée */}
        <path
          d="M 138 95 Q 118 130 101 172"
          fill="none"
          stroke="#4A3A2C"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <path
          d="M 138 95 Q 118 130 101 172"
          fill="none"
          stroke="#2C2118"
          strokeWidth="6.5"
          strokeLinecap="round"
          opacity="0.25"
        />
        <path d="M 88 168 L 106 163 L 108.5 184 L 90.5 189 Z" fill="url(#pg-bag)" />
        <path d="M 88 168 L 106 163 L 106.8 169.5 L 88.8 174.5 Z" fill="#7A5F3E" />
        <circle cx="97" cy="176" r="1.6" fill={OR} stroke="#3A2C1A" strokeWidth="0.6" />
      </g>
    );
  }

  if (outfit === "streetwear") {
    return (
      <g aria-hidden="true">
        {/* capuche derrière la nuque */}
        <path d={CAPUCHE} fill={fonce} />
        <path
          d="M 101.5 94.5 Q 106 82 120 81 Q 134 82 138.5 94.5"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.25"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d={TORSE_HOODIE} fill={etoffe} />
        {/* poche kangourou */}
        <path
          d="M 101 152 Q 120 160 139 152 L 137 173 Q 120 180 103 173 Z"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* cordons + embouts */}
        <path
          d="M 115 90 Q 114 97 113.5 103 M 125 90 Q 126 97 126.5 103"
          fill="none"
          stroke={ENCRE}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="113.4" cy="104.8" r="1.5" fill={ENCRE} />
        <circle cx="126.6" cy="104.8" r="1.5" fill={ENCRE} />
        {/* bord-côte du bas */}
        <path
          d="M 90 170.5 Q 120 179.5 150 170.5 L 149.5 178 Q 120 186.5 90.5 178 Z"
          fill={fonce}
        />
      </g>
    );
  }

  if (outfit === "bomber") {
    return (
      <g aria-hidden="true">
        <path d={TORSE_BOMBER} fill="url(#pg-bomber)" />
        {/* tee blanc au milieu */}
        <path d={TEE_BLANC} fill="url(#pg-teeW)" />
        {/* col côtelé */}
        <path
          d="M 107.5 86.5 L 114 82.5 Q 120 86.5 126 82.5 L 132.5 86.5 Q 126.5 93 120 93 Q 113.5 93 107.5 86.5 Z"
          fill="#1C1C1A"
        />
        {/* chaîne en or */}
        <path
          d="M 112.5 92 Q 120 100 127.5 92"
          fill="none"
          stroke={OR}
          strokeWidth="1.3"
        />
        {[
          [114.2, 94.6],
          [116.4, 96.6],
          [120, 97.6],
          [123.6, 96.6],
          [125.8, 94.6],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.2" fill="url(#pg-gold)" />
        ))}
        {/* fermeture éclair */}
        <path d="M 120 93.5 L 120 182" fill="none" stroke="#0F0F0E" strokeWidth="1.5" />
        <circle cx="120" cy="96" r="1.2" fill="#8C8C88" />
        {/* coutures d'épaules + poche */}
        <path
          d="M 92 104 Q 96 100 101 98 M 148 104 Q 144 100 139 98"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.3"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 139 122 L 148 124 L 147 138 L 138.5 135.5 Z"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.3"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* bord-côte bas */}
        <path
          d="M 89.5 171.5 Q 120 180.5 150.5 171.5 L 150.5 179 Q 120 188 89.5 179 Z"
          fill="#1C1C1A"
        />
        {/* reflet de matière */}
        <path
          d="M 92 110 Q 96 100 104 96"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.08"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  }

  // costard : blazer vert + chemise claire
  return (
    <g aria-hidden="true">
      <path d={TORSE_BOMBER} fill={etoffe} />
      {/* chemise en V */}
      <path d={TEE_BLANC} fill="url(#pg-teeW)" />
      {/* revers du blazer */}
      <path
        d="M 110.5 86.5 Q 116 92 119.5 126 L 108 110 Q 107 96 110.5 86.5 Z"
        fill={fonce}
      />
      <path
        d="M 129.5 86.5 Q 124 92 120.5 126 L 132 110 Q 133 96 129.5 86.5 Z"
        fill={fonce}
      />
      {/* bouton */}
      <circle cx="120" cy="130" r="1.5" fill={OR} stroke="#3A2C1A" strokeWidth="0.5" />
      {/* poche poitrine */}
      <path
        d="M 138 116 L 148 118"
        fill="none"
        stroke="#000000"
        strokeOpacity="0.3"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* mouchoir de poche */}
      <path d="M 139.5 114 L 143 112.5 L 145.5 114.5" fill="none" stroke="#F2EFE9" strokeWidth="2" strokeLinecap="round" />
      {/* bas du blazer */}
      <path
        d="M 89.5 171.5 Q 120 180.5 150.5 171.5 L 150.5 179 Q 120 188 89.5 179 Z"
        fill={fonce}
      />
    </g>
  );
}

// ————————————————————————————— Défs gradients —————————————————————————————

function Defs({ hair, outfit, skin }: { hair: HairId; outfit: Outfit; skin: SkinId }) {
  const peau = COULEURS_PEAU[skin];
  const cheveux = COULEURS_CHEVEUX[hair];
  const tenue = COULEURS_TENUES[outfit];

  return (
    <defs>
      <linearGradient id={`pg-skin-${skin}`} x1="0" y1="0" x2="0.9" y2="1.1">
        <stop offset="0" stopColor={nuance(peau, 0.18)} />
        <stop offset="0.48" stopColor={peau} />
        <stop offset="1" stopColor={nuance(peau, -0.26)} />
      </linearGradient>
      <linearGradient id={`pg-hair-${hair}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={nuance(cheveux, 0.14)} />
        <stop offset="1" stopColor={nuance(cheveux, -0.22)} />
      </linearGradient>
      <linearGradient id={`pg-cloth-${outfit}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={nuance(tenue, 0.16)} />
        <stop offset="0.55" stopColor={tenue} />
        <stop offset="1" stopColor={nuance(tenue, -0.2)} />
      </linearGradient>
      <linearGradient id="pg-jean" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4E6C8C" />
        <stop offset="1" stopColor="#2B3D52" />
      </linearGradient>
      <linearGradient id="pg-trousers" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3A3F45" />
        <stop offset="1" stopColor="#23272C" />
      </linearGradient>
      <linearGradient id="pg-teeW" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F5F2EA" />
        <stop offset="1" stopColor="#D9D3C6" />
      </linearGradient>
      <linearGradient id="pg-bomber" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#454542" />
        <stop offset="1" stopColor="#232321" />
      </linearGradient>
      <linearGradient id="pg-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F9DE8B" />
        <stop offset="1" stopColor="#B8860B" />
      </linearGradient>
      <linearGradient id="pg-boot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#332E28" />
        <stop offset="1" stopColor="#16130F" />
      </linearGradient>
      <linearGradient id="pg-shoe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E4DFD4" />
        <stop offset="1" stopColor="#C7C0B2" />
      </linearGradient>
      <linearGradient id="pg-bag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6B5236" />
        <stop offset="1" stopColor="#41301E" />
      </linearGradient>
    </defs>
  );
}

// ————————————————————————————— Composant —————————————————————————————

/**
 * Personnage du joueur (silhouette semi-réaliste, style « studio »).
 * Pur rendu : aucune logique, aucune dépendance au store.
 */
export function Avatar({
  hair,
  outfit,
  skin,
  beard = "aucune",
  mood = "neutre",
  framing = "full",
  className,
  label,
}: AvatarProps) {
  const peau = COULEURS_PEAU[skin];
  const couleurCheveux = COULEURS_CHEVEUX[hair];
  const peauFill = `url(#pg-skin-${skin})`;
  const portrait = framing === "portrait";

  return (
    <svg
      viewBox={portrait ? "80 2 80 118" : "0 0 240 424"}
      preserveAspectRatio={portrait ? "xMidYMin meet" : "xMidYMax meet"}
      role="img"
      aria-label={label ?? LIBELLE_DEFAUT}
      className={className ?? "w-full h-auto"}
    >
      <Defs hair={hair} outfit={outfit} skin={skin} />

      {/* ombre au sol (silhouette pleine uniquement) */}
      {!portrait && (
        <ellipse cx="120" cy="400" rx="54" ry="6" fill="#000000" opacity="0.15" />
      )}

      {/* ——— Cheveux, couche arrière ——— */}
      <CheveuxArriere hair={hair} couleur={couleurCheveux} />

      {/* ——— Jambes + chaussures ——— */}
      <Jambes outfit={outfit} peau={peau} />
      <Chaussures outfit={outfit} />

      {/* ——— Torse + détails + sacoche ——— */}
      <Torse outfit={outfit} peau={peau} />

      {/* ——— Bras + mains ——— */}
      <Bras outfit={outfit} peau={peau} />

      {/* ——— Cou ——— */}
      <g aria-hidden="true">
        <path d={COU} fill={peauFill} />
        <ellipse cx="120" cy="71.5" rx="6.5" ry="3.5" fill="#000000" opacity="0.14" />
      </g>

      {/* ——— Tête ——— */}
      <g aria-hidden="true">
        <ellipse cx="101.5" cy="51" rx="3" ry="5.2" fill={peau} />
        <ellipse cx="138.5" cy="51" rx="3" ry="5.2" fill={peau} />
        <path d={TETE} fill={peauFill} />
        {/* écouteur (bomber) */}
        {outfit === "bomber" && (
          <>
            <circle cx="138.5" cy="52" r="1.5" fill="#E8E4DA" />
            <circle cx="138.5" cy="52" r="0.7" fill="#5A554C" />
          </>
        )}
      </g>

      {/* ——— Visage (expression + barbe) ——— */}
      <Visage mood={mood} skin={skin} beard={beard} />

      {/* ——— Cheveux, couche avant ——— */}
      <CheveuxAvant hair={hair} couleur={couleurCheveux} />
    </svg>
  );
}
