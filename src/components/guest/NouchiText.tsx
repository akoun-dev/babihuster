"use client";

/**
 * Surlignage nouchi — acteur : JOUEUR (guest).
 *
 * Découpe un texte en mots du glossaire (GLOSSARY, data.ts) et entoure chaque
 * occurrence d'un Tooltip contenant la définition. Style : Soleil Ivoire,
 * souligné pointillé, curseur « aide ». Accessible au clavier (tabIndex 0).
 *
 * FEATURE-001_UX §4 (dialogue) & §7 (glossaire accessible au clavier).
 */

import { Fragment, useMemo } from "react";
import { GLOSSARY } from "@/lib/game/data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const LOOKUP: ReadonlyMap<string, string> = new Map(
  GLOSSARY.map((e) => [e.word.toLowerCase(), e.def]),
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Alternance insensible à la casse/accents des mots du glossaire (plus long d'abord). */
const PATTERN = new RegExp(
  `(${GLOSSARY.map((e) => escapeRegExp(e.word)).sort((a, b) => b.length - a.length).join("|")})`,
  "giu",
);

const BOUNDARY_RIGHT = /(?![\p{L}\p{N}])/u;
const BOUNDARY_LEFT = /(?<![\p{L}\p{N}])/u;

export interface NouchiTextProps {
  text: string;
  className?: string;
}

export function NouchiText({ text, className }: NouchiTextProps) {
  const parts = useMemo(() => {
    // Regex avec frontières de mots unicode : évite de matcher « Babi » dans
    // un mot composé, tout en gardant les expressions (« C'est gâté »).
    // ⚠ Groupe CAPTURANT autour de l'alternance : String.split inclut alors
    // chaque mot trouvé aux index impairs (sinon il serait supprimé !).
    const pattern = new RegExp(
      `${BOUNDARY_LEFT.source}(${GLOSSARY.map((e) => escapeRegExp(e.word)).sort((a, b) => b.length - a.length).join("|")})${BOUNDARY_RIGHT.source}`,
      "giu",
    );
    return text.split(pattern);
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const def = i % 2 === 1 ? LOOKUP.get(part.toLowerCase()) : undefined;
        if (!def) return <Fragment key={i}>{part}</Fragment>;
        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className="cursor-help text-game-soleil underline decoration-dotted decoration-2 underline-offset-[3px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-soleil/60"
              >
                {part}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-60 bg-game-panel text-game-text border-game-panel">
              <span className="font-semibold">{part}</span> — {def}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}
