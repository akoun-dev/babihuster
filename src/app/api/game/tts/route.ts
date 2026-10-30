/**
 * API TTS — voix de l'onboarding (FEATURE-002) — backend uniquement.
 *
 * POST /api/game/tts  { text, voice?, speed? }  →  audio/wav (binaire)
 *
 * Contraintes SDK (skills/TTS) : ≤ 1024 caractères par requête, speed ∈
 * [0.5, 2.0], stream=false obligatoire pour le format wav. Cache mémoire
 * (SHA-256 du texte+voix+speed) pour ne jamais régénérer deux fois la même
 * réplique — les textes de l'onboarding sont statiques (INTRO_TEXT, leçons,
 * répliques PNJ), le cache atteint vite 100 % de hits.
 *
 * ADR : le SDK z-ai-web-dev-sdk est interdit côté client → tout passe par
 * cette route, relative (gateway Caddy), runtime Node.js.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import type ZAI from "z-ai-web-dev-sdk";

/** Voix autorisées (skills/TTS §Available Voices). */
const VOICES = new Set([
  "tongtong",
  "chuichui",
  "xiaochen",
  "jam",
  "kazi",
  "douji",
  "luodo",
]);

const MAX_INPUT = 1024; // limite dure du SDK
const SPEED_MIN = 0.5;
const SPEED_MAX = 2;
const CACHE_LIMIT = 64;

/** Singleton SDK (best practice skill : créer une fois, réutiliser). */
let zaiPromise: Promise<Awaited<ReturnType<typeof ZAI.create>>> | null = null;
function getZAI() {
  zaiPromise ??= import("z-ai-web-dev-sdk").then((m) => m.default.create());
  return zaiPromise;
}

/** Cache mémoire FIFO — {clé sha256 → buffer wav}. */
const cache = new Map<string, Buffer>();

function cacheKey(text: string, voice: string, speed: number): string {
  return createHash("sha256")
    .update(`${voice}|${speed}|${text}`)
    .digest("hex");
}

function cachePut(key: string, wav: Buffer): void {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, wav);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { text, voice = "tongtong", speed = 1 } = (body ?? {}) as {
    text?: unknown;
    voice?: unknown;
    speed?: unknown;
  };

  // ——— Validation stricte des entrées ———
  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Texte requis (1 caractère minimum)." },
      { status: 400 },
    );
  }
  if (text.trim().length > MAX_INPUT) {
    return NextResponse.json(
      { error: `Texte trop long (${text.trim().length} > ${MAX_INPUT} caractères).` },
      { status: 400 },
    );
  }
  if (typeof voice !== "string" || !VOICES.has(voice)) {
    return NextResponse.json({ error: "Voix inconnue." }, { status: 400 });
  }
  const numericSpeed = typeof speed === "number" ? speed : Number(speed);
  if (
    !Number.isFinite(numericSpeed) ||
    numericSpeed < SPEED_MIN ||
    numericSpeed > SPEED_MAX
  ) {
    return NextResponse.json(
      { error: `Vitesse invalide (${SPEED_MIN}–${SPEED_MAX}).` },
      { status: 400 },
    );
  }

  // ——— Cache mémoire ———
  const trimmed = text.trim();
  const key = cacheKey(trimmed, voice, numericSpeed);
  const hit = cache.get(key);
  if (hit) {
    return new NextResponse(new Uint8Array(hit), {
      status: 200,
      headers: audioHeaders(hit.length),
    });
  }

  // ——— Génération ———
  try {
    const zai = await getZAI();
    const response = await zai.audio.tts.create({
      input: trimmed,
      voice,
      speed: numericSpeed,
      response_format: "wav",
      stream: false,
    });

    const arrayBuffer = await response.arrayBuffer();
    const wav = Buffer.from(new Uint8Array(arrayBuffer));
    if (wav.length === 0) throw new Error("Audio vide renvoyé par le service TTS.");

    cachePut(key, wav);
    return new NextResponse(new Uint8Array(wav), {
      status: 200,
      headers: audioHeaders(wav.length),
    });
  } catch (error) {
    console.error("[api/game/tts] Échec de génération :", error);
    return NextResponse.json(
      { error: "La synthèse vocale est indisponible, réessaie dans un instant." },
      { status: 502 },
    );
  }
}

function audioHeaders(length: number): HeadersInit {
  return {
    "Content-Type": "audio/wav",
    "Content-Length": String(length),
    "Cache-Control": "no-store",
  };
}
