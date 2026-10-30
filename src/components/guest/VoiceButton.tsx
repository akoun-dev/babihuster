"use client";

/**
 * VoiceButton — bouton « Écouter » de l'onboarding (FEATURE-002).
 *
 * Enveloppe accessible du hook useVoice : Volume2 au repos, Loader2 pendant
 * la génération, onde animée pendant la lecture. Un seul flux audio global
 * (singleton dans le hook) — re-cliquer stoppe la voix.
 *
 * Integrations : MainMenu & CharacterCreation (INTRO_TEXT), HowToPlay
 * (les 6 leçons), DialogueBox (réplique courante du tutoriel Momoh).
 */

import { Loader2, Volume2 } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";
import { cn } from "@/lib/utils";

export interface VoiceButtonProps {
  /** Texte à lire à voix haute (identique à celui affiché à l'écran). */
  text: string;
  /** Complément de libellé pour les lecteurs d'écran. */
  srLabel?: string;
  className?: string;
}

export function VoiceButton({ text, srLabel, className }: VoiceButtonProps) {
  const { status, toggle } = useVoice(text);
  const isLoading = status === "loading";
  const isPlaying = status === "playing";
  const preview = text.trim().slice(0, 40);

  return (
    <button
      type="button"
      onClick={() => toggle(text)}
      aria-pressed={isPlaying}
      aria-label={
        isPlaying
          ? `Arrêter la lecture vocale : ${preview}…`
          : `Écouter à voix haute ${srLabel ?? ""} : ${preview}…`.trim()
      }
      title={isPlaying ? "Arrêter la voix" : "Écouter la voix"}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-game-soleil/40 bg-game-bg/40 text-game-soleil transition-colors hover:bg-game-soleil/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-soleil/60 disabled:opacity-50",
        isPlaying && "animate-pulse border-game-soleil bg-game-soleil/20",
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Volume2 className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
