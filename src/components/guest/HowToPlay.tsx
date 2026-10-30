"use client";

/**
 * « Comment jouer » — acteur : JOUEUR (guest).
 *
 * Dialog d'aide (5 points clés). Auto-contenu : reçoit son bouton
 * déclencheur via la prop `trigger` (MainMenu, GameHUD).
 */

import { useState, type ReactNode } from "react";
import {
  BookOpen,
  Clock,
  Coins,
  HelpCircle,
  Moon,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GameIcon } from "@/components/guest/icons";
import { VoiceButton } from "@/components/guest/VoiceButton";
import { cn } from "@/lib/utils";

const TIPS: ReadonlyArray<{
  icon: ReactNode;
  title: string;
  text: string;
}> = [
  {
    icon: <Coins className="size-5 text-game-soleil" aria-hidden="true" />,
    title: "Objectif",
    text: "Percer à Babi : gagne des FCFA au djossi, monte ta Réputation et fais tourner l'économie du quartier.",
  },
  {
    icon: <Clock className="size-5 text-game-orange" aria-hidden="true" />,
    title: "Le temps file",
    text: "Chaque action coûte des minutes. Surveille tes 4 jauges — Faim, Énergie, Moral, Hygiène. Dors pour passer au jour suivant.",
  },
  {
    icon: <GameIcon name="Wrench" size={20} className="text-game-vert" />,
    title: "Système D & Tchatche",
    text: "Gratte, négocie au marché, improvisa. Tes compétences montent avec l'XP et débloquent des réussites aléatoires.",
  },
  {
    icon: <GameIcon name="PiggyBank" size={20} className="text-game-soleil" />,
    title: "Tontine J+7",
    text: "Cotise 2 000 F chez Maman Adjoua après la mission M1 : à ton tour (J+7), le pot commun te rend 10 000 F.",
  },
  {
    icon: <ShieldAlert className="size-5 text-game-alerte" aria-hidden="true" />,
    title: "Dash & microbes",
    text: "La nuit, évite le terrain. Face à la police, le « dash » coûte cher — une bonne Tchatche peut tout désamorcer.",
  },
  {
    icon: <Moon className="size-5 text-game-nuit" aria-hidden="true" />,
    title: "Sauvegarde auto",
    text: "Ta partie est sauvegardée dans le navigateur à chaque action ; le bouton ☁ du HUD l'envoie aussi dans le cloud.",
  },
];

/** Texte lu par la voix : les 6 leçons enchaînées (≈ 700 caractères < limite API). */
const TIPS_VOICE_TEXT = TIPS.map((tip) => `${tip.title}. ${tip.text}`).join(" ");

export interface HowToPlayProps {
  /** Déclencheur (Button) rendu via DialogTrigger asChild. */
  trigger: ReactNode;
}

export function HowToPlay({ trigger }: HowToPlayProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-game-panel bg-game-bg text-game-text sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="flex items-center gap-2 text-game-text">
              <HelpCircle className="size-5 text-game-soleil" aria-hidden="true" />
              Comment jouer
            </DialogTitle>
            <VoiceButton text={TIPS_VOICE_TEXT} srLabel="des leçons" />
          </div>
          <DialogDescription className="text-game-muted">
            Les règles de Yopougon, en 6 leçons, môgô.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-3">
          {TIPS.map((tip) => (
            <li
              key={tip.title}
              className="game-panel flex items-start gap-3 rounded-lg p-3"
            >
              <span className="mt-0.5 shrink-0">{tip.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-game-text">{tip.title}</p>
                <p className={cn("mt-1 text-sm leading-relaxed text-game-muted")}>
                  {tip.text}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="flex items-center gap-2 text-xs text-game-muted">
          <BookOpen className="size-4 shrink-0" aria-hidden="true" />
          Astuce : les mots nouchi sont surlignés en or — survole-les (ou focus-les) pour le glossaire.
        </p>
      </DialogContent>
    </Dialog>
  );
}
