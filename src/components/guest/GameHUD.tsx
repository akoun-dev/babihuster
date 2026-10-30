"use client";

/**
 * HUD de jeu — acteur : JOUEUR (guest).
 *
 * Barre sticky sous le header : jour + horloge + icône de phase, solde FCFA,
 * 4 jauges (shadcn Progress, couleurs UX §11, pulsation < 25 %), réputation,
 * badge tontine, et boutons d'action (Missions, Glossaire, Aide, Cloud save
 * avec toast, Retour menu avec AlertDialog de confirmation).
 */

import { useMemo, useState } from "react";
import {
  BookOpen,
  CloudUpload,
  HelpCircle,
  Home,
  Loader2,
  type LucideIcon,
  Moon,
  MoonStar,
  Sun,
  SunMedium,
  Sunset,
} from "lucide-react";
import { formatClock, dayPhase, type DayPhase } from "@/lib/game/engine";
import { NEED_LABELS, type GameState, type NeedId } from "@/lib/game/types";
import { offeredMissions, useGame } from "@/lib/game/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GlossarySheet } from "@/components/guest/GlossarySheet";
import { HowToPlay } from "@/components/guest/HowToPlay";
import { MissionSheet } from "@/components/guest/MissionSheet";

const PHASE_ICON: Record<DayPhase, LucideIcon> = {
  matin: Sun,
  apremidi: SunMedium,
  soir: Sunset,
  nuit: Moon,
  profonde: MoonStar,
};
const PHASE_LABEL: Record<DayPhase, string> = {
  matin: "Matin",
  apremidi: "Après-midi",
  soir: "Soirée",
  nuit: "Nuit",
  profonde: "Nuit profonde",
};

const NEED_INDICATOR: Record<NeedId, string> = {
  faim: "[&_[data-slot=progress-indicator]]:bg-game-soleil",
  energie: "[&_[data-slot=progress-indicator]]:bg-game-orange",
  moral: "[&_[data-slot=progress-indicator]]:bg-game-vert",
  hygiene: "[&_[data-slot=progress-indicator]]:bg-game-hygiene",
};

const NEED_ORDER: NeedId[] = ["faim", "energie", "moral", "hygiene"];

const fmtFCFA = new Intl.NumberFormat("fr-FR");

function NeedGauge({ id, value }: { id: NeedId; value: number }) {
  const alert = value < 25;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium text-game-muted">
          {NEED_LABELS[id]}
        </span>
        <span
          className={cn(
            "text-[11px] font-bold tabular-nums",
            alert ? "text-game-alerte" : "text-game-text",
          )}
        >
          {Math.round(value)} %
        </span>
      </div>
      <Progress
        value={value}
        aria-label={`${NEED_LABELS[id]} : ${Math.round(value)} pour cent`}
        className={cn(
          "mt-1 h-1.5 bg-game-bg/80 [&_[data-slot=progress-indicator]]:transition-all",
          NEED_INDICATOR[id],
          alert && "game-need-alert",
        )}
      />
    </div>
  );
}

export function GameHUD() {
  const game = useGame((s) => s.game) as GameState;
  const cloudBusy = useGame((s) => s.cloudBusy);
  const saveCloud = useGame((s) => s.saveCloud);
  const resetGame = useGame((s) => s.resetGame);
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);

  const offeredCount = useMemo(() => offeredMissions(game).length, [game]);
  const phase = dayPhase(game.minute);
  const PhaseIcon = PHASE_ICON[phase];

  async function handleSave() {
    setSaving(true);
    const result = await saveCloud();
    setSaving(false);
    if (result === "ok") {
      toast({
        title: "Sauvegarde cloud effectuée",
        description: "Ta partie est en sécurité, môgô.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Sauvegarde cloud impossible",
        description:
          "Pas de panique : ta partie reste enregistrée sur cet appareil.",
      });
    }
  }

  return (
    <nav
      aria-label="Tableau de bord du jeu"
      className="sticky top-16 z-30 border-b border-game-text/10 bg-game-bg/95 backdrop-blur supports-[backdrop-filter]:bg-game-bg/85"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-2 py-2 sm:px-4 lg:px-6">
        {/* ——— Ligne 1 : temps, argent, réputation, tontine, boutons ——— */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="flex items-center gap-1.5 text-sm font-bold text-game-text">
            Jour {game.day}
            <span aria-hidden="true" className="text-game-muted">
              ·
            </span>
            <span className="tabular-nums">{formatClock(game.minute)}</span>
            <PhaseIcon
              className="size-4 text-game-soleil"
              aria-label={`Phase : ${PHASE_LABEL[phase]}`}
              role="img"
            />
            <span className="sr-only">{PHASE_LABEL[phase]}</span>
          </p>

          <p
            aria-live="polite"
            className="flex items-center gap-1.5 text-sm font-bold tabular-nums text-game-soleil"
          >
            <span aria-hidden="true">💰</span>
            {fmtFCFA.format(game.money)} F
            <span className="sr-only">FCFA en poche</span>
          </p>

          <Badge
            aria-label={`Réputation ${game.rep} sur 100`}
            className="border-transparent bg-game-terre px-2 py-0.5 text-[11px] font-bold text-white"
          >
            Réputation {game.rep}
          </Badge>

          {game.tontine.member && game.tontine.payoutDay !== null && (
            <Badge
              aria-label={`Membre de la tontine, payout au jour ${game.tontine.payoutDay}`}
              className="border-transparent bg-game-soleil/20 px-2 py-0.5 text-[11px] font-bold text-game-soleil"
            >
              Tontine J{game.tontine.payoutDay}
            </Badge>
          )}

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <MissionSheet
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Missions${offeredCount > 0 ? ` — ${offeredCount} nouvelle(s) offerte(s)` : ""}`}
                  className="relative min-h-11 min-w-11 text-game-text hover:bg-game-panel hover:text-game-text"
                >
                  <BookOpen aria-hidden="true" />
                  {offeredCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-game-alerte ring-2 ring-game-bg"
                    />
                  )}
                </Button>
              }
            />
            <GlossarySheet
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Glossaire Nouchi"
                  className="min-h-11 min-w-11 text-game-text hover:bg-game-panel hover:text-game-text"
                >
                  <BookOpen aria-hidden="true" />
                </Button>
              }
            />
            <HowToPlay
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Comment jouer"
                  className="min-h-11 min-w-11 text-game-text hover:bg-game-panel hover:text-game-text"
                >
                  <HelpCircle aria-hidden="true" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={cloudBusy || saving}
              aria-label="Sauvegarder dans le cloud"
              aria-busy={cloudBusy || saving}
              className="min-h-11 min-w-11 text-game-text hover:bg-game-panel hover:text-game-text"
            >
              {cloudBusy || saving ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <CloudUpload aria-hidden="true" />
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Retour au menu principal"
                  className="min-h-11 min-w-11 text-game-text hover:bg-game-panel hover:text-game-text"
                >
                  <Home aria-hidden="true" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-game-panel bg-game-bg text-game-text">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-game-text">
                    Retour au menu ?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-game-muted">
                    Cette partie sera effacée de cet appareil (sauvegarde cloud
                    non supprimée). Tu pourras en créer une nouvelle, môgô.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="min-h-11 border-game-text/20 bg-transparent text-game-text hover:bg-game-panel hover:text-game-text">
                    Rester
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetGame}
                    className="min-h-11 bg-game-alerte text-white hover:bg-game-alerte/90"
                  >
                    Retour au menu
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* ——— Ligne 2 : jauges (Sims-like) ——— */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {NEED_ORDER.map((id) => (
            <NeedGauge key={id} id={id} value={game.needs[id]} />
          ))}
        </div>
      </div>
    </nav>
  );
}
