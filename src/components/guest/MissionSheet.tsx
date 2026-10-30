"use client";

/**
 * Carnet de missions — acteur : JOUEUR (guest).
 *
 * Sheet latérale à onglets (Offertes / Actives / Terminées) listant MISSIONS
 * avec étapes ✅ selon `missions[id].step` et statut. Bouton « Accepter » pour
 * les missions offertes (store.acceptMission). Échéance M2 affichée si présente.
 */

import { type ReactNode } from "react";
import { CheckCircle2, CircleDashed, Flag, XCircle } from "lucide-react";
import { MISSIONS } from "@/lib/game/data";
import { formatClock } from "@/lib/game/engine";
import type { GameState, MissionDef, MissionStatus } from "@/lib/game/types";
import { offeredMissions, useGame } from "@/lib/game/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameIcon } from "@/components/guest/icons";

const STATUS_BADGE: Record<MissionStatus, { label: string; className: string }> = {
  locked: { label: "Verrouillée", className: "bg-game-muted/20 text-game-muted" },
  offered: { label: "Offerte", className: "bg-game-soleil/20 text-game-soleil" },
  active: { label: "Active", className: "bg-game-orange/20 text-game-orange" },
  done: { label: "Terminée", className: "bg-game-vert/20 text-game-vert" },
  failed: { label: "Échouée", className: "bg-game-alerte/20 text-game-alerte" },
};

function MissionCard({
  mission,
  game,
  onAccept,
}: {
  mission: MissionDef;
  game: GameState;
  onAccept: (id: MissionDef["id"]) => void;
}) {
  const state = game.missions[mission.id];
  const badge = STATUS_BADGE[state.status];
  const totalSteps = mission.steps.length;
  const doneSteps =
    state.status === "done" ? totalSteps : Math.min(state.step, totalSteps);

  return (
    <li className="game-panel border-tricolore rounded-lg p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-game-bg/60"
            aria-hidden="true"
          >
            <GameIcon name={mission.icon} size={18} className="text-game-soleil" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-game-text">{mission.title}</p>
            <p className="text-xs text-game-muted">
              Donnée par {mission.giver}
            </p>
          </div>
        </div>
        <Badge className={`border-transparent ${badge.className}`}>
          {badge.label}
        </Badge>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-game-text/90">
        {mission.pitch}
      </p>

      <ol className="mt-2 flex flex-col gap-1">
        {mission.steps.map((step, i) => {
          const ok = state.status === "done" || i < doneSteps;
          return (
            <li key={step} className="flex items-start gap-1.5 text-sm">
              {ok ? (
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-game-vert"
                  aria-label="Étape validée"
                />
              ) : (
                <CircleDashed
                  className="mt-0.5 size-4 shrink-0 text-game-muted"
                  aria-label="Étape à faire"
                />
              )}
              <span className={ok ? "text-game-text/70 line-through" : "text-game-text/90"}>
                {step}
              </span>
            </li>
          );
        })}
      </ol>

      {state.deadline && state.status === "active" && (
        <p className="mt-2 text-xs font-medium text-game-alerte">
          ⏱ Échéance : J{state.deadline.day} à {formatClock(state.deadline.minute)}
        </p>
      )}

      <p className="mt-2 text-xs text-game-muted">
        Récompense : {mission.reward}
      </p>

      {state.status === "offered" && (
        <Button
          size="sm"
          onClick={() => onAccept(mission.id)}
          className="mt-3 min-h-11 w-full bg-game-soleil text-black hover:bg-game-soleil/90 sm:w-auto"
        >
          <Flag aria-hidden="true" />
          Accepter
        </Button>
      )}
    </li>
  );
}

function MissionList({
  statuses,
  game,
  onAccept,
  emptyText,
}: {
  statuses: MissionStatus[];
  game: GameState;
  onAccept: (id: MissionDef["id"]) => void;
  emptyText: string;
}) {
  const missions = MISSIONS.filter((m) => statuses.includes(game.missions[m.id].status));
  if (missions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-game-muted">{emptyText}</p>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {missions.map((m) => (
        <MissionCard key={m.id} mission={m} game={game} onAccept={onAccept} />
      ))}
    </ul>
  );
}

export interface MissionSheetProps {
  /** Déclencheur (bouton icône du HUD) rendu via SheetTrigger asChild. */
  trigger: ReactNode;
}

export function MissionSheet({ trigger }: MissionSheetProps) {
  const game = useGame((s) => s.game);
  const acceptMission = useGame((s) => s.acceptMission);
  const offeredCount = offeredMissions(game).length;

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 border-game-panel bg-game-bg text-game-text sm:max-w-md">
        <SheetHeader className="border-b border-game-text/10">
          <SheetTitle className="flex items-center gap-2 text-game-text">
            <Flag className="size-5 text-game-soleil" aria-hidden="true" />
            Missions
          </SheetTitle>
          <SheetDescription className="text-game-muted">
            Les gigs qui font la légende de Yop.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 [scrollbar-gutter:stable]">
          {game ? (
            <Tabs defaultValue="offered">
              <TabsList className="grid w-full grid-cols-3 bg-game-panel">
                <TabsTrigger value="offered" className="text-game-muted data-[state=active]:bg-game-bg data-[state=active]:text-game-text">
                  Offertes{offeredCount > 0 ? ` (${offeredCount})` : ""}
                </TabsTrigger>
                <TabsTrigger value="active" className="text-game-muted data-[state=active]:bg-game-bg data-[state=active]:text-game-text">
                  Actives
                </TabsTrigger>
                <TabsTrigger value="done" className="text-game-muted data-[state=active]:bg-game-bg data-[state=active]:text-game-text">
                  Finies
                </TabsTrigger>
              </TabsList>

              <TabsContent value="offered" className="mt-3">
                <MissionList
                  statuses={["offered"]}
                  game={game}
                  onAccept={acceptMission}
                  emptyText="Aucune mission offerte. Passe parler aux PNJ des zones !"
                />
              </TabsContent>
              <TabsContent value="active" className="mt-3">
                <MissionList
                  statuses={["active", "locked"]}
                  game={game}
                  onAccept={acceptMission}
                  emptyText="Aucune mission en cours. Accepte une mission offerte."
                />
              </TabsContent>
              <TabsContent value="done" className="mt-3">
                <MissionList
                  statuses={["done", "failed"]}
                  game={game}
                  onAccept={acceptMission}
                  emptyText="Rien ici encore — termine ta première mission !"
                />
              </TabsContent>
            </Tabs>
          ) : (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-game-muted">
              <XCircle className="size-4" aria-hidden="true" />
              Aucune partie en cours.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
