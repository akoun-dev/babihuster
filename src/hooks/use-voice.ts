"use client";

/**
 * useVoice — lecture vocale de l'onboarding (FEATURE-002, Rév. B — T-023-a).
 *
 * ⚠ Retour utilisateur réel : certains appareils n'exposent AUCUNE voix
 * française (toast « Voix indisponible »). Stratégie en 2 voies :
 *
 * 1. NATIF — `window.speechSynthesis` avec voix fr de l'appareil si elle
 *    existe : latence nulle, zéro serveur. Découpage en énoncés ≤ 180
 *    caractères (contourne le bug Chrome de coupure ~15 s).
 * 2. SERVEUR (fallback) — POST /api/game/tts (voix `kazi`, sélectionnée par
 *    boucle objective TTS→ASR) → blob WAV → <audio>. File de chunks ≤ 900
 *    caractères (limite SDK 1024), cache blob local, AbortController pour
 *    l'annulation. État `loading` pendant la génération (1–10 s).
 *
 * Design conservé : mini-store externe (useSyncExternalStore), clé = texte,
 * un seul flux audio global (speechSynthesis ET l'<audio> sont singletons),
 * arrêt propre au changement de texte / unmount.
 */

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { toast } from "@/hooks/use-toast";

const LANG = "fr-FR";
/** Longueur max d'un énoncé natif (contourne le bug Chrome de coupure ~15 s). */
const CHUNK_LIMIT = 180;
/** Longueur max d'un chunk serveur (limite dure SDK : 1024). */
const SERVER_CHUNK_LIMIT = 900;
/** Nombre max de blobs audio conservés en mémoire (FIFO). */
const BLOB_CACHE_LIMIT = 48;

export type VoiceStatus = "idle" | "loading" | "playing";

interface VoiceState {
  /** Texte en cours de lecture (ou de génération). */
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

/** Contrôleur du fetch serveur en cours (annulation réseau). */
let abortController: AbortController | null = null;

/** Singleton <audio> de la voie serveur. */
let audioEl: HTMLAudioElement | null = null;
function ensureAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

/** Cache blob local — {chunk normalisé → objectURL}. FIFO. */
const blobCache = new Map<string, string>();

function blobCachePut(key: string, url: string): void {
  if (blobCache.size >= BLOB_CACHE_LIMIT) {
    const oldest = blobCache.keys().next().value;
    if (oldest !== undefined) {
      const stale = blobCache.get(oldest);
      if (stale) URL.revokeObjectURL(stale);
      blobCache.delete(oldest);
    }
  }
  blobCache.set(key, url);
}

/** Découpe un texte en chunks ≤ limit aux frontières de phrases. */
function splitIntoChunks(text: string, limit: number): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length <= limit) {
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
 * l'appareil n'en expose pas → la voie serveur prend le relais (T-023-a).
 */
function pickFrenchVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const fr = voices.filter((v) => v.lang?.toLowerCase().startsWith("fr"));
  return fr.find((v) => v.localService) ?? fr[0] ?? undefined;
}

/** Récupère (cache ou POST /api/game/tts) l'objectURL d'un chunk. */
async function fetchChunkUrl(chunk: string, signal: AbortSignal): Promise<string> {
  const cached = blobCache.get(chunk);
  if (cached) {
    // LRU simple : réinsère en fin de Map.
    blobCache.delete(chunk);
    blobCache.set(chunk, cached);
    return cached;
  }
  const res = await fetch("/api/game/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: chunk }),
    signal,
  });
  if (!res.ok) throw new Error(`tts:${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  blobCachePut(chunk, url);
  return url;
}

/** Joue une URL sur le singleton audio ; résout à la fin, rejette sur erreur. */
function playUrl(url: string, token: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = ensureAudio();
    audio.src = url;
    let interval: number | undefined;
    const onEnded = (): void => {
      cleanup();
      resolve();
    };
    const onError = (): void => {
      cleanup();
      reject(new Error("audio-error"));
    };
    const cleanup = (): void => {
      if (interval !== undefined) window.clearInterval(interval);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
    // Si stop() passe entre-temps, le token change → promesse résolue sans suite.
    const checkToken = (): void => {
      if (token !== playToken) {
        cleanup();
        resolve();
      }
    };
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    interval = window.setInterval(checkToken, 250);
    void audio.play().catch((err: unknown) => {
      cleanup();
      reject(err instanceof Error ? err : new Error("play-failed"));
    });
  });
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
    abortController?.abort();
    abortController = null;
    if (audioEl) {
      audioEl.pause();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (state.key !== null || state.status !== "idle") {
      emit({ key: null, status: "idle" });
    }
  }, []);

  const toggle = useCallback(
    (text: string) => {
      // Toggle : re-cliquer sur le bouton actif (loading ou playing) stoppe.
      if (state.key === text && state.status !== "idle") {
        stop();
        return;
      }

      const synth =
        typeof window !== "undefined" && "speechSynthesis" in window
          ? window.speechSynthesis
          : null;
      const nativeVoice = pickFrenchVoice();

      // ——— Voie 1 : Web Speech native (voix fr présente sur l'appareil) ———
      if (synth && nativeVoice) {
        synth.cancel(); // coupe toute lecture précédente (singleton global)
        const token = ++playToken;
        abortController?.abort();
        abortController = null;
        audioEl?.pause();
        emit({ key: text, status: "playing" });

        const chunks = splitIntoChunks(text, CHUNK_LIMIT);
        let index = 0;

        const speakNext = (): void => {
          if (token !== playToken) return; // annulé entre deux énoncés
          if (index >= chunks.length) {
            emit({ key: null, status: "idle" });
            return;
          }
          const utterance = new SpeechSynthesisUtterance(chunks[index++]);
          utterance.lang = LANG;
          utterance.voice = nativeVoice;
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
        return;
      }

      // ——— Voie 2 : serveur kazi (aucune voix fr sur l'appareil, T-023-a) ———
      if (typeof window === "undefined") return;
      const token = ++playToken;
      const controller = new AbortController();
      abortController = controller;
      emit({ key: text, status: "loading" });

      const chunks = splitIntoChunks(text, SERVER_CHUNK_LIMIT);
      let started = false;

      void (async (): Promise<void> => {
        try {
          for (const chunk of chunks) {
            const url = await fetchChunkUrl(chunk, controller.signal);
            if (token !== playToken) return;
            if (!started) {
              started = true;
              emit({ key: text, status: "playing" });
            }
            await playUrl(url, token);
            if (token !== playToken) return;
          }
          if (token === playToken) {
            emit({ key: null, status: "idle" });
          }
        } catch (error) {
          if (token !== playToken) return; // stop() volontaire → silence
          if (error instanceof DOMException && error.name === "AbortError") return;
          emit({ key: null, status: "idle" });
          toast({
            title: "Voix indisponible",
            description: "La synthèse vocale est en pause, réessaie dans un instant.",
            variant: "destructive",
          });
        } finally {
          if (token === playToken) {
            abortController = null;
          }
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
      if (state.key === keyText) stop();
    };
  }, [keyText, stop]);

  return { status, toggle, stop };
}
