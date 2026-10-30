"use client";

/**
 * useVoice — lecture vocale de l'onboarding (FEATURE-002) — acteur : JOUEUR.
 *
 * Hook client unique pour tous les boutons « Écouter » : un SEUL élément
 * <audio> global (jamais deux voix en même temps), cache de blobs en
 * session, file de lecture séquentielle si le texte dépasse la limite SDK
 * (découpe par phrases ≤ 900 caractères, l'API tolère jusqu'à 1024).
 *
 * État partagé via un mini-store externe (useSyncExternalStore, même pattern
 * que GameShell) : chaque VoiceButton dérive son statut de la clé de texte
 * globale — donc deux boutons portant le même texte (menu + création)
 * s'activent ensemble.
 *
 * Arrêt propre : `stop()` à l'unmount du bouton (prop stopOnUnmount) pour
 * couper la voix quand un dialog se ferme ou qu'on avance dans le dialogue.
 */

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { toast } from "@/hooks/use-toast";

export const DEFAULT_VOICE = "tongtong";

/** Limite par requête API (SDK : 1024 durs, marge de sécurité). */
const CHUNK_LIMIT = 900;

type VoiceStatus = "idle" | "loading" | "playing";

interface VoiceState {
  /** Clé du texte en cours (voice|speed|text). */
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

/** Élément audio singleton — une seule voix à la fois, partout. */
let audioEl: HTMLAudioElement | null = null;
function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

/** Cache de blobs en session — clé = voice|speed|text → objectURL. */
const blobCache = new Map<string, string>();

/** Jeton d'annulation : toute nouvelle lecture ou stop() invalide la file. */
let playToken = 0;

/** Découpe un long texte en chunks ≤ CHUNK_LIMIT aux frontières de phrases. */
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

/** Appelle l'API TTS et retourne un objectURL lisible par <audio>. */
async function fetchAudioUrl(
  text: string,
  voice: string,
  speed: number,
): Promise<string> {
  const res = await fetch("/api/game/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, speed }),
  });
  if (!res.ok) {
    let message = "La voix est indisponible pour l'instant.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* corps non-JSON : message par défaut */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export interface UseVoiceResult {
  /** Statut du texte courant (idle si un AUTRE texte est en lecture). */
  status: VoiceStatus;
  /** Lance (ou stoppe, si déjà actif) la lecture de ce texte. */
  toggle: (text: string, options?: { voice?: string; speed?: number }) => void;
  /** Coupe immédiatement toute lecture en cours. */
  stop: () => void;
}

export function useVoice(keyText: string): UseVoiceResult {
  const globalState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const voiceKey = `${DEFAULT_VOICE}|1|${keyText}`;

  const status: VoiceStatus =
    globalState.key === voiceKey ? globalState.status : "idle";

  const stop = useCallback(() => {
    playToken += 1;
    if (state.key !== null || state.status !== "idle") {
      emit({ key: null, status: "idle" });
    }
    if (audioEl) {
      audioEl.pause();
      audioEl.removeAttribute("src");
    }
  }, []);

  const toggle = useCallback(
    (text: string, options?: { voice?: string; speed?: number }) => {
      const voice = options?.voice ?? DEFAULT_VOICE;
      const speed = options?.speed ?? 1;
      const key = `${voice}|${speed}|${text}`;

      // Toggle : re-cliquer sur le bouton actif stoppe la voix.
      if (state.key === key && state.status !== "idle") {
        stop();
        return;
      }

      const token = ++playToken;
      emit({ key, status: "loading" });

      void (async () => {
        try {
          const chunks = text.length > CHUNK_LIMIT ? splitIntoChunks(text) : [text];
          const urls: string[] = [];
          for (const chunk of chunks) {
            const cacheKey = `${voice}|${speed}|${chunk}`;
            let url = blobCache.get(cacheKey);
            if (!url) {
              url = await fetchAudioUrl(chunk, voice, speed);
              blobCache.set(cacheKey, url);
            }
            urls.push(url);
            if (token !== playToken) return; // annulé entre deux chunks
          }

          const audio = getAudio();
          // Lecture effective : publier l'état « playing » (l'audio peut
          // démarrer après le chargement du blob — on émet AVANT la file).
          emit({ key, status: "playing" });
          for (const url of urls) {
            if (token !== playToken) return; // annulé pendant la file
            await new Promise<void>((resolve, reject) => {
              const onEnded = () => {
                cleanup();
                resolve();
              };
              const onError = () => {
                cleanup();
                reject(new Error("Lecture audio impossible sur cet appareil."));
              };
              const cleanup = () => {
                audio.removeEventListener("ended", onEnded);
                audio.removeEventListener("error", onError);
              };
              audio.addEventListener("ended", onEnded);
              audio.addEventListener("error", onError);
              audio.src = url;
              audio.currentTime = 0;
              audio.play().catch(onError);
            });
          }

          // File terminée normalement → retour au repos.
          if (token === playToken) emit({ key: null, status: "idle" });
        } catch (error) {
          if (token !== playToken) return; // annulation volontaire : silence
          emit({ key: null, status: "idle" });
          toast({
            title: "Voix indisponible",
            description:
              error instanceof Error
                ? error.message
                : "Réessaie dans un instant, môgô.",
            variant: "destructive",
          });
        }
      })();
    },
    [stop],
  );

  // Arrêt propre : si le texte change (le joueur avance dans le dialogue)
  // ou si le composant se démonte (fermeture d'un dialog), on coupe la voix
  // — mais uniquement si c'est CE texte qui est en cours de lecture.
  useEffect(() => {
    return () => {
      if (state.key === voiceKey) stop();
    };
  }, [voiceKey, stop]);

  return { status, toggle, stop };
}
