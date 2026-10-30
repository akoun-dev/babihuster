"use client";

/**
 * Panneau d'actions — acteur : JOUEUR (guest).
 *
 * Titre = zone courante + description ; liste des actions de la zone
 * (ACTIONS filtrées) : bouton pleine largeur avec résumé des coûts/effets.
 * Action désactivée si `actionBlockedReason(game, a) !== null` — raison en
 * tooltip ET en texte visible (mobile sans hover). `special === "talk"` →
 * talkToNpc(npcId), sinon doAction(id). Compétences + inventaire en badges.
 */

import {
  Bed,
  Clock3,
  CookingPot,
  Shirt,
  Smartphone,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ACTIONS } from "@/lib/game/data";
import { actionBlockedReason, zoneById } from "@/lib/game/engine";
import {
  NEED_LABELS,
  SKILL_LABELS,
  type ActionDef,
  type GameState,
  type NeedId,
  type SkillId,
} from "@/lib/game/types";
import { useGame } from "@/lib/game/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GameIcon } from "@/components/guest/icons";

const SKILL_ORDER: SkillId[] = ["tchatche", "systemeD", "endurance", "reseau"];

function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "good" | "bad" | "gold";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "text-game-muted",
    good: "text-game-vert",
    bad: "text-game-alerte",
    gold: "text-game-soleil",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-game-bg/50 px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function ActionRow({ action, game }: { action: ActionDef; game: GameState }) {
  const doAction = useGame((s) => s.doAction);
  const talkToNpc = useGame((s) => s.talkToNpc);
  const reason = actionBlockedReason(game, action);
  const blocked = reason !== null;

  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Span porteur d'événements : le Button disabled n'écoute plus la
              souris, le tooltip (et l'aria-label de raison) restent accessibles. */}
          <span
            className={cn("block w-full", blocked && "cursor-not-allowed")}
            tabIndex={blocked ? 0 : undefined}
            role={blocked ? "note" : undefined}
            aria-label={blocked ? `Action indisponible : ${reason}` : undefined}
          >
            <Button
              type="button"
              disabled={blocked}
              onClick={() => {
                if (action.special === "talk" && action.npcId) {
                  talkToNpc(action.npcId);
                } else {
                  doAction(action.id);
                }
              }}
              className={cn(
                "min-h-11 h-auto w-full justify-start gap-3 border border-game-text/12 bg-game-bg/60 px-3 py-2.5 text-left text-game-text hover:bg-game-panel hover:text-game-text focus-visible:ring-game-soleil/60",
                blocked && "opacity-55",
              )}
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-md bg-game-panel"
                aria-hidden="true"
              >
                <GameIcon name={action.icon} size={18} className="text-game-soleil" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold">{action.label}</span>
                  {action.negotiable && (
                    <Badge className="border-transparent bg-game-nuit px-1.5 py-0 text-[10px] text-game-hygiene">
                      Négociable
                    </Badge>
                  )}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-1">
                  <Chip>
                    <Clock3 className="size-3" aria-hidden="true" />
                    {action.minutes} min
                  </Chip>
                  {action.cost > 0 && (
                    <Chip tone="bad">
                      <TrendingDown className="size-3" aria-hidden="true" />-
                      {action.cost} F
                    </Chip>
                  )}
                  {action.money !== undefined && action.money > 0 && (
                    <Chip tone="gold">
                      <TrendingUp className="size-3" aria-hidden="true" />+
                      {action.money} F
                    </Chip>
                  )}
                  {(
                    Object.entries(action.needs ?? {}) as Array<
                      [NeedId, number]
                    >
                  ).map(([need, delta]) => (
                    <Chip
                      key={need}
                      tone={delta >= 0 ? "good" : "bad"}
                    >
                      {NEED_LABELS[need]} {delta >= 0 ? "+" : ""}
                      {delta}
                    </Chip>
                  ))}
                  {action.xp &&
                    Object.keys(action.xp).map((skill) => (
                      <Chip key={skill}>
                        +XP {SKILL_LABELS[skill as SkillId]}
                      </Chip>
                    ))}
                </span>
              </span>
            </Button>
          </span>
        </TooltipTrigger>
        {blocked && reason && (
          <TooltipContent className="max-w-60 border-game-panel bg-game-panel text-game-text">
            {reason}
          </TooltipContent>
        )}
      </Tooltip>
      {blocked && reason && (
        <p className="mt-1 px-1 text-xs font-medium text-game-alerte" role="note">
          {reason}
        </p>
      )}
    </li>
  );
}

export function ActionPanel({ game }: { game: GameState }) {
  const zone = zoneById(game.zone);
  if (!zone) return null;
  const zoneActions = ACTIONS.filter((a) => a.zone === game.zone);

  return (
    <section aria-label={`Actions — ${zone.name}`} className="game-panel rounded-xl p-4">
      <header className="flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-game-bg/60"
          style={{ color: zone.color }}
          aria-hidden="true"
        >
          <GameIcon name={zone.icon} size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-black tracking-tight text-game-text">
            {zone.name}
          </h2>
          <p className="mt-0.5 text-sm leading-relaxed text-game-muted">
            {zone.description}
          </p>
        </div>
      </header>

      <ul className="mt-4 flex flex-col gap-2">
        {zoneActions.map((a) => (
          <ActionRow key={a.id} action={a} game={game} />
        ))}
      </ul>

      {/* ——— Compétences ——— */}
      <div className="mt-5 border-t border-game-text/10 pt-4">
        <h3 className="text-xs font-bold tracking-wide text-game-muted uppercase">
          Compétences
        </h3>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Niveaux de compétences">
          {SKILL_ORDER.map((id) => (
            <li key={id}>
              <Badge
                aria-label={`${SKILL_LABELS[id]} niveau ${game.skills[id].level}`}
                className="border-game-soleil/30 bg-game-soleil/10 text-xs font-semibold text-game-soleil"
              >
                {SKILL_LABELS[id]} · Lv {game.skills[id].level}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      {/* ——— Inventaire ——— */}
      <div className="mt-4">
        <h3 className="text-xs font-bold tracking-wide text-game-muted uppercase">
          Inventaire
        </h3>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Inventaire">
          <li>
            <Badge
              variant="outline"
              aria-label={`Matelas : ${game.inventory.matelas ? "possédé" : "non possédé"}`}
              className={cn(
                "gap-1 border-game-text/15 text-xs",
                game.inventory.matelas ? "text-game-vert" : "text-game-muted",
              )}
            >
              <Bed className="size-3.5" aria-hidden="true" />
              Matelas {game.inventory.matelas ? "✓" : "✗"}
            </Badge>
          </li>
          <li>
            <Badge
              variant="outline"
              aria-label={`Tenue de soirée : ${game.inventory.tenueSoiree ? "possédée" : "non possédée"}`}
              className={cn(
                "gap-1 border-game-text/15 text-xs",
                game.inventory.tenueSoiree ? "text-game-vert" : "text-game-muted",
              )}
            >
              <Shirt className="size-3.5" aria-hidden="true" />
              Tenue {game.inventory.tenueSoiree ? "✓" : "✗"}
            </Badge>
          </li>
          <li>
            <Badge
              variant="outline"
              aria-label={`Provisions : ${game.inventory.provisions}`}
              className="gap-1 border-game-text/15 text-xs text-game-text"
            >
              <CookingPot className="size-3.5" aria-hidden="true" />
              Provisions ×{game.inventory.provisions}
            </Badge>
          </li>
          <li>
            <Badge
              variant="outline"
              aria-label={`Téléphone : ${game.inventory.telephone ? "possédé" : "non possédé"}`}
              className="gap-1 border-game-text/15 text-xs text-game-vert"
            >
              <Smartphone className="size-3.5" aria-hidden="true" />
              Téléphone {game.inventory.telephone ? "✓" : "✗"}
            </Badge>
          </li>
        </ul>
      </div>
    </section>
  );
}
