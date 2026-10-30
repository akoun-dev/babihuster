"use client";

/**
 * Store Zustand d'Abidjan Hustle — acteur : JOUEUR (guest).
 * Couche entre l'UI et le moteur pur (engine.ts). Conformité GOVERNANCE §5 :
 * aucun fetch dans les composants, état persisté localement (version 1).
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getDeviceId } from "@/lib/utils-uuid";
import {
  acceptMission as engineAccept,
  applyAction,
  closeDaySummary,
  newGameState,
  resolveEvent,
  talkTo as engineTalk,
  travel,
} from "./engine";
import { MISSIONS } from "./data";
import type { GameState, MissionId, Outfit, TransportId, ZoneId } from "./types";

export type Screen = "menu" | "creation" | "game";

interface DialogueState {
  npcId: string;
  lines: string[];
  index: number;
}

interface GameStore {
  /** Non persisté */
  screen: Screen;
  dialogue: DialogueState | null;
  cloudBusy: boolean;

  /** Persisté */
  game: GameState | null;

  // — Navigation —
  setScreen: (s: Screen) => void;
  newGame: (name: string, outfit: Outfit) => void;
  resetGame: () => void;

  // — Boucle de jeu —
  doAction: (actionId: string) => void;
  travelTo: (zone: ZoneId, mode: TransportId) => void;
  chooseEvent: (choiceId: string) => void;
  acceptMission: (id: MissionId) => void;
  talkToNpc: (npcId: string) => void;
  advanceDialogue: () => void;
  endDay: () => void;

  // — Cloud save (deviceId anonyme, 1 slot) —
  saveCloud: () => Promise<"ok" | "error">;
  loadCloud: () => Promise<"ok" | "empty" | "error">;
}

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      screen: "menu",
      dialogue: null,
      cloudBusy: false,
      game: null,

      setScreen: (screen) => set({ screen }),

      newGame: (name, outfit) =>
        set({
          game: newGameState(name, outfit),
          screen: "game",
          dialogue: null,
        }),

      resetGame: () => set({ game: null, screen: "menu", dialogue: null }),

      doAction: (actionId) => {
        const { game } = get();
        if (!game || game.pendingEvent) return;
        set({ game: applyAction(game, actionId) });
      },

      travelTo: (zone, mode) => {
        const { game } = get();
        if (!game || game.pendingEvent) return;
        set({ game: travel(game, zone, mode) });
      },

      chooseEvent: (choiceId) => {
        const { game } = get();
        if (!game || !game.pendingEvent) return;
        set({ game: resolveEvent(game, choiceId) });
      },

      acceptMission: (id) => {
        const { game } = get();
        if (!game) return;
        const next = engineAccept(game, id);
        if (next !== game) set({ game: next });
      },

      talkToNpc: (npcId) => {
        const { game } = get();
        if (!game || game.pendingEvent) return;
        const result = engineTalk(game, npcId);
        if (!result.lines.length) return;
        set({ game: result.state, dialogue: { npcId, lines: result.lines, index: 0 } });
      },

      advanceDialogue: () => {
        const { dialogue, game } = get();
        if (!dialogue) return;
        if (dialogue.index < dialogue.lines.length - 1) {
          set({ dialogue: { ...dialogue, index: dialogue.index + 1 } });
        } else {
          set({ dialogue: null });
          if (game && game.flags.introSeen === false) {
            set({ game: { ...game, flags: { ...game.flags, introSeen: true } } });
          }
        }
      },

      endDay: () => {
        const { game } = get();
        if (!game) return;
        set({ game: closeDaySummary(game) });
      },

      saveCloud: async () => {
        const { game } = get();
        if (!game) return "error";
        set({ cloudBusy: true });
        try {
          const deviceId = getDeviceId();
          const res = await fetch("/api/game/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceId, playerName: game.name, state: game }),
          });
          if (!res.ok) return "error";
          return "ok";
        } catch {
          return "error";
        } finally {
          set({ cloudBusy: false });
        }
      },

      loadCloud: async () => {
        set({ cloudBusy: true });
        try {
          const deviceId = getDeviceId();
          if (!deviceId) return "error";
          const res = await fetch(`/api/game/load?deviceId=${encodeURIComponent(deviceId)}`);
          if (!res.ok) return "error";
          const data: { ok: boolean; save: { state: GameState } | null } = await res.json();
          if (!data.ok || !data.save) return "empty";
          if (data.save.state.version !== 1) return "error";
          set({ game: data.save.state, screen: "game", dialogue: null });
          return "ok";
        } catch {
          return "error";
        } finally {
          set({ cloudBusy: false });
        }
      },
    }),
    {
      name: "abidjan-hustle-save-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ game: s.game }),
    },
  ),
);

/** Liste des missions offertes (helpers UI) */
export function offeredMissions(game: GameState | null): MissionId[] {
  if (!game) return [];
  return MISSIONS.filter((m) => game.missions[m.id].status === "offered").map((m) => m.id);
}
