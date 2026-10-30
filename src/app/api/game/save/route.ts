/**
 * POST /api/game/save — sauvegarde cloud anonyme (1 slot par deviceId).
 * Acteur : JOUEUR (guest). Validation zod stricte, upsert sur deviceId.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const outcomeSchema = z.object({
  text: z.string(),
  money: z.number().int().optional(),
  needs: z.record(z.string(), z.number().int()).optional(),
  xp: z.record(z.string(), z.number().int()).optional(),
  rep: z.number().int().optional(),
  flags: z.record(z.string(), z.union([z.boolean(), z.number()])).optional(),
  log: z.string(),
  kind: z.string(),
});

const gameStateSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1).max(20),
  outfit: z.enum(["pagne", "streetwear", "costard"]),
  day: z.number().int().positive(),
  minute: z.number().int().min(0).max(1560),
  money: z.number().int().min(0).max(9_999_999),
  rep: z.number().int().min(0).max(100),
  zone: z.string(),
  needs: z.object({
    faim: z.number().int().min(0).max(100),
    energie: z.number().int().min(0).max(100),
    moral: z.number().int().min(0).max(100),
    hygiene: z.number().int().min(0).max(100),
  }),
  skills: z.record(
    z.string(),
    z.object({ xp: z.number().int().min(0), level: z.number().int().min(1).max(5) }),
  ),
  inventory: z.object({
    matelas: z.boolean(),
    tenueSoiree: z.boolean(),
    provisions: z.number().int().min(0),
    telephone: z.boolean(),
  }),
  missions: z.record(
    z.string(),
    z.object({
      status: z.enum(["locked", "offered", "active", "done", "failed"]),
      step: z.number().int().min(0),
      deadline: z
        .object({ day: z.number().int(), minute: z.number().int() })
        .nullable(),
    }),
  ),
  tontine: z.object({
    member: z.boolean(),
    daysPaid: z.number().int().min(0),
    payoutDay: z.number().int().nullable(),
  }),
  flags: z.record(z.string(), z.union([z.boolean(), z.number()])),
  pendingEvent: z
    .object({
      id: z.string(),
      title: z.string(),
      icon: z.string(),
      text: z.string(),
      choices: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            outcome: outcomeSchema,
          }),
        )
        .max(4),
    })
    .nullable(),
  pendingSummary: z.boolean(),
  journal: z
    .array(z.object({ t: z.string(), text: z.string(), kind: z.string() }))
    .max(60),
  dayStats: z.object({ earned: z.number().int(), spent: z.number().int() }),
});

const bodySchema = z.object({
  deviceId: z.string().uuid(),
  playerName: z.string().min(1).max(20),
  state: gameStateSchema,
});

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Payload invalide" },
        { status: 400 },
      );
    }
    const { deviceId, playerName, state } = parsed.data;
    const stateJson = JSON.stringify(state);
    if (stateJson.length > 64 * 1024) {
      return NextResponse.json({ ok: false, error: "Sauvegarde trop lourde" }, { status: 400 });
    }

    await db.saveGame.upsert({
      where: { deviceId },
      update: { playerName, stateJson },
      create: { deviceId, playerName, stateJson },
    });

    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    console.error("[api/game/save] erreur:", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
