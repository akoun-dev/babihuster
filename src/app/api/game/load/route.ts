/**
 * GET /api/game/load?deviceId=… — reprise de sauvegarde cloud anonyme.
 * Acteur : JOUEUR (guest). Jamais de 500 sur absence (save: null).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const querySchema = z.object({ deviceId: z.string().uuid() });

export async function GET(req: NextRequest) {
  try {
    const parsed = querySchema.safeParse({
      deviceId: req.nextUrl.searchParams.get("deviceId") ?? "",
    });
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "deviceId invalide" }, { status: 400 });
    }

    const save = await db.saveGame.findUnique({
      where: { deviceId: parsed.data.deviceId },
      select: { stateJson: true, updatedAt: true, playerName: true },
    });

    if (!save) {
      return NextResponse.json({ ok: true, save: null });
    }

    return NextResponse.json({
      ok: true,
      save: {
        playerName: save.playerName,
        updatedAt: save.updatedAt,
        state: JSON.parse(save.stateJson) as unknown,
      },
    });
  } catch (err) {
    console.error("[api/game/load] erreur:", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
