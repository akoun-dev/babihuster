/**
 * Avatar du joueur — acteur : JOUEUR (guest).
 *
 * Portrait vectoriel flat (buste de face, viewBox 120×130) dessiné en SVG
 * pur à partir des choix de personnalisation : coiffure (`hair`), tenue
 * (`outfit`) et teinte de peau (`skin`). Les couleurs viennent de la source
 * de vérité `HAIRSTYLES` / `OUTFITS` / `SKIN_TONES` (data.ts), copiées dans
 * des lookup maps locales — aucune couleur de peau/cheveu/tenue en dur ici.
 *
 * Renvoi : FEATURE-003 (création de personnage, T-023). Composant 100 %
 * présentationnel (pas de hooks, pas de "use client") : rendu net à 40 px
 * (HUD) comme à 160 px (écran de création).
 */

import type { HairId, Outfit, SkinId } from "@/lib/game/types";
import { HAIRSTYLES, OUTFITS, SKIN_TONES } from "@/lib/game/data";

/** Libellé accessible par défaut du portrait. */
const LIBELLE_DEFAUT = "Portrait de ton personnage";

/** Encre sombre du thème « Noir Maquis » (yeux, sourcils, sourire, cordons). */
const ENCRE = "#1a1410";

/** Or du thème (perles des tresses, motif wax du pagne). */
const OR = "#f4b942";

/** Casque de cheveux courant (coupe / dégradé / dreads / tresses). */
const CASQUE =
  "M 35.1 54 A 25 28 0 0 1 84.9 54 Q 76 44.5 60 43.5 Q 44 44.5 35.1 54 Z";

/** Buste (épaules + torse) ancré au bas du cadre. */
const TORSE = "M 14 130 C 14 106 33 95 60 95 C 87 95 106 106 106 130 Z";

/** Pagne : étoffe enveloppant le bas du buste (épaules dénudées). */
const PAGNE_ETOFFE =
  "M 15 130 C 15 112 31 102.5 60 102.5 C 89 102.5 105 112 105 130 Z";

/** Ombre de mâchoire : croissant suivant le bas de l'ovale du visage. */
const OMBRE_MACHOIRE =
  "M 36.65 66 A 25 28 0 0 0 83.35 66 Q 60 76 36.65 66 Z";

/** Bande d'ombre « crâne rasé » : fin croissant au sommet du crâne. */
const RASE_OMBRE =
  "M 39.5 40 A 25 28 0 0 1 80.5 40 Q 60 33.5 39.5 40 Z";

/** Rasures du dégradé (shaved lines), une par tempe. */
const RASURES_DEGRADE = [
  "M 41.5 46.5 Q 39.3 54 40.3 62",
  "M 78.5 46.5 Q 80.7 54 79.7 62",
];

/** Dreads : 6 grosses mèches (3 par côté) tombant jusqu'aux épaules. */
const MECHEES_DREADS = [
  "M 38 46 Q 28.5 52 26.5 72",
  "M 41 44 Q 33 56 31 80",
  "M 44 42 Q 37.5 58 36 94",
  "M 82 46 Q 91.5 52 93.5 72",
  "M 79 44 Q 87 56 89 80",
  "M 76 42 Q 82.5 58 84 94",
];

/** Mèches de dreads repassées plus sombres (profondeur). */
const MECHEES_DREADS_OMBRE = [
  "M 41 44 Q 33 56 31 80",
  "M 44 42 Q 37.5 58 36 94",
  "M 79 44 Q 87 56 89 80",
  "M 76 42 Q 82.5 58 84 94",
];

/** Afro : nuage de boules débordant autour du crâne (cercle + 6 arcs). */
const BOULES_AFRO: Array<[number, number, number]> = [
  [31, 42, 10],
  [38, 30, 11],
  [49, 21, 12],
  [71, 21, 12],
  [82, 30, 11],
  [89, 42, 10],
];

/** Afro : fines arches internes pour la texture du puff. */
const TEXTURES_AFRO = [
  "M 33 36 Q 36 26 45 20",
  "M 52 17 Q 60 13 68 17",
  "M 75 20 Q 84 26 87 36",
];

/** Tresses : 5 raies cornrows au-dessus du crâne. */
const RAIES_TRESSES = [
  "M 60 43.5 L 60 29.8",
  "M 53 43.8 Q 50.5 36 48.5 30.5",
  "M 67 43.8 Q 69.5 36 71.5 30.5",
  "M 46 45.5 Q 41.5 38.5 38.5 33",
  "M 74 45.5 Q 78.5 38.5 81.5 33",
];

/** Tresses : mèches latérales plaquées (3 par côté). */
const MECHEES_TRESSES = [
  "M 40 44 Q 33.5 54 32 68",
  "M 45 46 Q 40 56 39.5 70",
  "M 36 43 Q 30.5 50 29.5 60",
  "M 80 44 Q 86.5 54 88 68",
  "M 75 46 Q 80 56 80.5 70",
  "M 84 43 Q 89.5 50 90.5 60",
];

/** Tresses : 3 perles dorées au bas de chaque mèche latérale externe. */
const PERLES_TRESSES: Array<[number, number]> = [
  [31.9, 70.6],
  [31.7, 73.4],
  [31.5, 76.2],
  [88.1, 70.6],
  [88.3, 73.4],
  [88.5, 76.2],
];

/** Pagne wax : petits points dorés autour du rond-point central. */
const POINTS_WAX: Array<[number, number]> = [
  [40, 109.5],
  [80, 109.5],
  [32.5, 121],
  [87.5, 121],
  [48, 126.5],
  [72, 126.5],
];

// ————— Lookup maps (source de vérité : data.ts) —————

const COULEURS_CHEVEUX = Object.fromEntries(
  HAIRSTYLES.map((h) => [h.id, h.color] as const)
) as Record<HairId, string>;

const COULEURS_PEAU = Object.fromEntries(
  SKIN_TONES.map((s) => [s.id, s.color] as const)
) as Record<SkinId, string>;

const COULEURS_TENUES = Object.fromEntries(
  OUTFITS.map((o) => [o.id, o.color] as const)
) as Record<Outfit, string>;

export interface AvatarProps {
  hair: HairId;
  outfit: Outfit;
  skin: SkinId;
  /** Taille rendue : le composant remplit son conteneur (w-full h-auto). */
  className?: string;
  /** Libellé accessible du SVG (role="img"). Défaut : "Portrait de ton personnage". */
  label?: string;
}

/** Couches cheveux dessinées DERRIÈRE la tête (puff afro, mèches de dreads). */
function CheveuxArriere({ hair, couleur }: { hair: HairId; couleur: string }) {
  if (hair === "afro") {
    return (
      <g aria-hidden="true">
        <circle cx="60" cy="50" r="33" fill={couleur} />
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
      <g aria-hidden="true">
        {MECHEES_DREADS.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={couleur}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        ))}
        {MECHEES_DREADS_OMBRE.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="#000000"
            strokeOpacity="0.3"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  }
  return null;
}

/** Couches cheveux dessinées DEVANT la tête (casque, rasures, tresses). */
function CheveuxAvant({ hair, couleur }: { hair: HairId; couleur: string }) {
  if (hair === "afro") return null; // puff déjà dessiné derrière la tête

  return (
    <g aria-hidden="true">
      {hair === "rase" ? (
        // Crâne rasé : simple ombre très courte au sommet du crâne
        <path d={RASE_OMBRE} fill={couleur} opacity="0.25" />
      ) : (
        // Casque court épousant le crâne (coupe, dégradé, dreads, tresses)
        <path d={CASQUE} fill={couleur} />
      )}

      {hair === "degrade" &&
        RASURES_DEGRADE.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="#000000"
            strokeOpacity="0.4"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ))}

      {hair === "tresses" && (
        <>
          {/* raies cornrows */}
          {RAIES_TRESSES.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="#000000"
              strokeOpacity="0.45"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ))}
          {/* mèches latérales plaquées */}
          {MECHEES_TRESSES.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={couleur}
              strokeWidth="4.2"
              strokeLinecap="round"
            />
          ))}
          {/* perles dorées en bas des mèches latérales */}
          {PERLES_TRESSES.map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="1.7"
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

/** Buste : peau pour le pagne (épaules dénudées), étoffe pour les autres. */
function Buste({
  outfit,
  peau,
  couleur,
}: {
  outfit: Outfit;
  peau: string;
  couleur: string;
}) {
  return (
    <path
      aria-hidden="true"
      d={TORSE}
      fill={outfit === "pagne" ? peau : couleur}
    />
  );
}

/** Tenue : couche arrière — capuche du hoodie derrière la nuque. */
function TenueArriere({ outfit, couleur }: { outfit: Outfit; couleur: string }) {
  if (outfit !== "streetwear") return null;
  return (
    <g aria-hidden="true">
      <path
        d="M 40 97 Q 41.5 84.5 51 82.5 Q 60 85.5 69 82.5 Q 78.5 84.5 80 97 Q 60 90 40 97 Z"
        fill={couleur}
      />
      {/* pli intérieur de la capuche */}
      <path
        d="M 45.5 93.5 Q 52 87.5 60 88.5 Q 68 87.5 74.5 93.5"
        fill="none"
        stroke="#000000"
        strokeOpacity="0.22"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Tenue : détails avant (motif wax, cordons/poche, col costard). */
function TenueDetails({
  outfit,
  peau,
  couleur,
}: {
  outfit: Outfit;
  peau: string;
  couleur: string;
}) {
  if (outfit === "pagne") {
    return (
      <g aria-hidden="true">
        {/* étoffe enveloppant le bas du buste, épaules dénudées */}
        <path d={PAGNE_ETOFFE} fill={couleur} />
        {/* bretelle de pagne passant sur l'épaule droite */}
        <path
          d="M 67 105.5 Q 75.5 96.5 86 100.5"
          fill="none"
          stroke={couleur}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 67 105.5 Q 75.5 96.5 86 100.5"
          fill="none"
          stroke={OR}
          strokeOpacity="0.75"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* motif wax : rond-point central + petits cercles dorés */}
        <circle cx="60" cy="117" r="8.5" fill="none" stroke={OR} strokeWidth="2" />
        <circle cx="60" cy="117" r="2.6" fill={OR} />
        {POINTS_WAX.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.7" fill={OR} />
        ))}
      </g>
    );
  }

  if (outfit === "streetwear") {
    return (
      <g aria-hidden="true">
        {/* encolure du hoodie */}
        <path
          d="M 47.5 97 Q 60 105 72.5 97"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* cordons + embouts */}
        <path
          d="M 55.5 102.5 Q 54.8 107 53.8 111 M 64.5 102.5 Q 65.2 107 66.2 111"
          fill="none"
          stroke={ENCRE}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="53.6" cy="112.8" r="1.5" fill={ENCRE} />
        <circle cx="66.4" cy="112.8" r="1.5" fill={ENCRE} />
        {/* poche kangourou suggérée */}
        <path
          d="M 46 118 Q 60 124 74 118 M 47.5 118.8 L 49 129.5 M 72.5 118.8 L 71 129.5"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.18"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    );
  }

  // costard : chemise à col ouvert + liseré blanc
  return (
    <g aria-hidden="true">
      {/* encolure ouverte laissant voir la poitrine */}
      <path d="M 48.5 95.5 Q 60 100.5 71.5 95.5 L 60 108.5 Z" fill={peau} />
      {/* pointes de col avec liseré blanc */}
      <path
        d="M 46.5 94.5 Q 53.5 96.5 60 97.5 L 54.5 110 Z"
        fill={couleur}
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M 73.5 94.5 Q 66.5 96.5 60 97.5 L 65.5 110 Z"
        fill={couleur}
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* patte de boutonnage + boutons */}
      <path
        d="M 60 111.5 L 60 129.5"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.6"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="116.5" r="1.2" fill="#FFFFFF" opacity="0.9" />
      <circle cx="60" cy="123.5" r="1.2" fill="#FFFFFF" opacity="0.9" />
    </g>
  );
}

/**
 * Portrait du personnage (buste de face, style flat vectoriel Yopougon).
 * Pur rendu : aucune logique, aucune dépendance au store.
 */
export function Avatar({ hair, outfit, skin, className, label }: AvatarProps) {
  const couleurCheveux = COULEURS_CHEVEUX[hair];
  const couleurPeau = COULEURS_PEAU[skin];
  const couleurTenue = COULEURS_TENUES[outfit];

  return (
    <svg
      viewBox="0 0 120 130"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label={label ?? LIBELLE_DEFAUT}
      className={className ?? "w-full h-auto"}
    >
      {/* ——— Oreilles ——— */}
      <g aria-hidden="true">
        <ellipse cx="34.5" cy="57" rx="4" ry="6" fill={couleurPeau} />
        <ellipse cx="85.5" cy="57" rx="4" ry="6" fill={couleurPeau} />
        <path
          d="M 34 54.5 Q 33 57 34 59.5 M 86 54.5 Q 87 57 86 59.5"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.15"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>

      {/* ——— Cheveux, couche arrière (afro / dreads) ——— */}
      <CheveuxArriere hair={hair} couleur={couleurCheveux} />

      {/* ——— Buste ——— */}
      <Buste outfit={outfit} peau={couleurPeau} couleur={couleurTenue} />

      {/* ——— Tenue, couche arrière (capuche du hoodie) ——— */}
      <TenueArriere outfit={outfit} couleur={couleurTenue} />

      {/* ——— Cou ——— */}
      <g aria-hidden="true">
        <rect x="53" y="72" width="14" height="24" fill={couleurPeau} />
        {/* ombre portée du menton sur le cou */}
        <ellipse cx="60" cy="84" rx="7.5" ry="4" fill="#000000" opacity="0.12" />
      </g>

      {/* ——— Tête ——— */}
      <g aria-hidden="true">
        <ellipse cx="60" cy="56" rx="25" ry="28" fill={couleurPeau} />
        {/* ombre de mâchoire subtile */}
        <path d={OMBRE_MACHOIRE} fill="#000000" opacity="0.08" />
        {/* reflet blanc sur la joue */}
        <ellipse cx="72.5" cy="62" rx="4.2" ry="7" fill="#FFFFFF" opacity="0.15" />
        {/* reflet du crâne (visible tête rasée uniquement) */}
        {hair === "rase" && (
          <ellipse
            cx="68"
            cy="38"
            rx="6.5"
            ry="4"
            fill="#FFFFFF"
            opacity="0.15"
            transform="rotate(-18 68 38)"
          />
        )}
      </g>

      {/* ——— Visage ——— */}
      <g aria-hidden="true">
        {/* sourcils fins */}
        <path
          d="M 45.8 50.6 Q 50 48.2 54 50.2 M 66 50.2 Q 70 48.2 74.2 50.6"
          fill="none"
          stroke={ENCRE}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        {/* yeux */}
        <circle cx="50" cy="56" r="2.2" fill={ENCRE} />
        <circle cx="70" cy="56" r="2.2" fill={ENCRE} />
        {/* sourire confiant */}
        <path
          d="M 53.5 65.5 Q 60.5 70.8 66.8 65.2"
          fill="none"
          stroke={ENCRE}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* ——— Cheveux, couche avant ——— */}
      <CheveuxAvant hair={hair} couleur={couleurCheveux} />

      {/* ——— Tenue, détails avant ——— */}
      <TenueDetails outfit={outfit} peau={couleurPeau} couleur={couleurTenue} />
    </svg>
  );
}
