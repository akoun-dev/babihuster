"use client";

/**
 * useVoice — lecture vocale de l'onboarding (FEATURE-002, Révision A).
 *
 * ⚠ PIVOT après retour utilisateur : le SDK TTS backend ne rend pas le
 * français (voix orientées zh/en) → remplacé par l'API native du navigateur
 * `window.speechSynthesis` avec voix française de l'appareil (fr-FR).
 * Bénéfices : prononciation réellement française, latence nulle (plus de
 * file de génération 1–22 s), zéro appel serveur.
 *
 * Design conservé : mini-store externe (useSyncExternalStore), clé = texte,
 * un seul flux audio global (speechSynthesis EST un singleton), arrêt propre
 * au changement de texte / unmount. Contourne le bug Chrome (coupure ~15 s)
 * en découpant le texte en phrases ≤ 180 caractères, énoncées mises en file.
 */

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { toast } from "@/hooks/use-toast";

const LANG = "fr-FR";
/** Longueur max d'un énoncé (contourne le bug Chrome de coupure ~15 s). */
const CHUNK_LIMIT = 180;

export type VoiceStatus = "idle" | "playing";

interface VoiceState {
  /** Texte en cours de lecture. */
  key: string | null;
  status: VoiceStatus;
}

let state: VoiceState = { key: null, status: "idle" };
const listeners = new Set<() => void>();

function emit(next: VoiceState): void {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): VoiceState {
  return state;
}

/** Jeton d'annulation : tout stop() ou nouvelle lecture invalide la file. */
let playToken = 0;

/** Découpe un texte en chunks ≤ CHUNK_LIMIT aux frontières de phrases. */
function splitIntoChunks(text: string): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length <= CHUNK_LIMIT) {
      current += sentence;
    } else {
      if (current.trim()) chunks.push(current.trim());
      current = sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

/**
 * Meilleure voix française de l'appareil : voix locale d'abord (offline,
 * pas de bug de timeout), sinon la première voix fr. Retourne undefined si
 * l'appareil n'en expose pas — l'attribut `lang` de l'énoncé prend le relais.
 */
function pickFrenchVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const fr = voices.filter((v) => v.lang?.toLowerCase().startsWith("fr"));
  return fr.find((v) => v.localService) ?? fr[0] ?? undefined;
}

export interface UseVoiceResult {
  /** Statut du texte courant (idle si un AUTRE texte est en lecture). */
  status: VoiceStatus;
  /** Lance (ou stoppe, si déjà actif) la lecture de ce texte. */
  toggle: (text: string) => void;
  /** Coupe immédiatement toute lecture en cours. */
  stop: () => void;
}

export function useVoice(keyText: string): UseVoiceResult {
  const globalState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const status: VoiceStatus =
    globalState.key === keyText ? globalState.status : "idle";

  const stop = useCallback(() => {
    playToken += 1;
    if (state.key !== null || state.status !== "idle") {
      emit({ key: null, status: "idle" });
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const toggle = useCallback(
    (text: string) => {
      // Toggle : re-cliquer sur le bouton actif stoppe la voix.
      if (state.key === text && state.status === "playing") {
        stop();
        return;
      }

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        toast({
          title: "Voix indisponible",
          description: "Ce navigateur ne supporte pas la synthèse vocale.",
          variant: "destructive",
        });
        return;
      }

      const synth = window.speechSynthesis;
      synth.cancel(); // coupe toute lecture précédente (singleton global)
      const token = ++playToken;
      emit({ key: text, status: "playing" });

      const chunks = splitIntoChunks(text);
      const voice = pickFrenchVoice();
      let index = 0;

      const speakNext = (): void => {
        if (token !== playToken) return; // annulé entre deux énoncés
        if (index >= chunks.length) {
          emit({ key: null, status: "idle" });
          return;
        }
        const utterance = new SpeechSynthesisUtterance(chunks[index++]);
        utterance.lang = LANG;
        if (voice) utterance.voice = voice;
        utterance.rate = 1;
        utterance.onend = speakNext;
        utterance.onerror = (event) => {
          // « interrupted »/« canceled » = stop() volontaire → silence.
          if (
            token !== playToken ||
            event.error === "interrupted" ||
            event.error === "canceled"
          ) {
            return;
          }
          emit({ key: null, status: "idle" });
          toast({
            title: "Voix indisponible",
            description: "Aucune voix française n'a pu être lancée sur cet appareil.",
            variant: "destructive",
          });
        };
        try {
          synth.speak(utterance);
        } catch {
          // Certains moteurs jettent en synchrone (aucune voix installée…).
          utterance.onerror(
            new SpeechSynthesisErrorEvent("error", {
              error: "synthesis-failed",
              utterance,
            }),
          );
        }
      };

      speakNext();
    },
    [stop],
  );

  // Arrêt propre : si le texte change (le joueur avance dans le dialogue)
  // ou si le composant se démonte (fermeture d'un dialog), on coupe la voix
  // — mais uniquement si c'est CE texte qui est en cours de lecture.
  useEffect(() => {
    return () => {
      if (state.key === keyText) stop();
    };
  }, [keyText, stop]);

  return { status, toggle, stop };
}
