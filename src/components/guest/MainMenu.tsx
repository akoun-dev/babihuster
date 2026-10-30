"use client";

/**
 * Écran MENU — acteur : JOUEUR (guest) / VISITEUR.
 *
 * Héros plein écran « coucher de soleil sur la lagune » (gradient-lagune),
 * pitch (INTRO_TEXT avec surlignage nouchi), CTA Nouvelle partie / Continuer,
 * accès Comment jouer + Glossaire Nouchi, et 3 mini-cards mécaniques.
 *
 * FEATURE-001_UX §4 (wireframe MENU) & §11 (palette).
 */

import { PiggyBank, Play, Rocket, ShieldAlert, Wrench } from "lucide-react";
import { GLOSSARY, INTRO_TEXT } from "@/lib/game/data";
import { useGame } from "@/lib/game/store";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";
import { Button } from "@/components/ui/button";
import { NouchiText } from "@/components/guest/NouchiText";
import { GlossarySheet } from "@/components/guest/GlossarySheet";
import { HowToPlay } from "@/components/guest/HowToPlay";

const MECHANICS = [
  {
    icon: Wrench,
    color: "text-game-vert",
    title: "Système D",
    text: "Gratter, négocier, improviser : à Babi, la débrouille est un art. Montre ce que tu vaux.",
  },
  {
    icon: PiggyBank,
    color: "text-game-soleil",
    title: "Tontine",
    text: "Cotise 2 000 F chez Maman Adjoua. À J+7, le pot commun tombe : 10 000 F pour toi, banana !",
  },
  {
    icon: ShieldAlert,
    color: "text-game-terre",
    title: "Dash",
    text: "Police, microbes, imprévus : le dash (pot-de-vin) peut te sauver… ou te ruiner. La tchatche aussi.",
  },
] as const;

export function MainMenu() {
  const game = useGame((s) => s.game);
  const setScreen = useGame((s) => s.setScreen);

  return (
    <div className="flex flex-col">
      {/* ——— Héros : coucher de soleil sur la lagune ——— */}
      <section
        aria-labelledby="game-title"
        className="gradient-lagune relative isolate"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-14 text-game-bg sm:px-6 sm:py-20 lg:px-8">
          {/* Badge tricolore ivoirien discret */}
          <span
            aria-label="Drapeau ivoirien"
            className="inline-flex h-1.5 w-14 overflow-hidden rounded-full ring-1 ring-black/20"
          >
            <span className="w-1/3 bg-[#F37021]" />
            <span className="w-1/3 bg-white" />
            <span className="w-1/3 bg-[#009A44]" />
          </span>

          <p className="mt-4 text-sm font-semibold tracking-[0.2em] uppercase opacity-80">
            {APP_TAGLINE} — Vertical Slice : Yopougon
          </p>
          <h1
            id="game-title"
            className="mt-2 text-4xl font-black tracking-tight text-balance drop-shadow-sm sm:text-6xl"
          >
            {APP_NAME}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base font-medium sm:text-lg">
            Tu débarques à Yopougon avec 2 000 F en poche. Djossi, tontine,
            garba et enjaillement : à toi de faire le pays, môgô.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setScreen("creation")}
              className="min-h-12 bg-game-bg px-6 text-base font-bold text-game-soleil shadow-lg hover:bg-game-bg/90 focus-visible:ring-game-bg"
            >
              <Rocket aria-hidden="true" />
              Nouvelle partie
            </Button>
            <Button
              onClick={() => setScreen("game")}
              disabled={!game}
              className="min-h-12 border-2 border-game-bg/60 bg-transparent px-6 text-base font-bold text-game-bg hover:bg-game-bg/15 focus-visible:ring-game-bg"
              aria-disabled={!game}
            >
              <Play aria-hidden="true" />
              Continuer{game ? ` — ${game.name}` : ""}
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <HowToPlay
              trigger={
                <Button
                  variant="ghost"
                  className="min-h-11 border border-game-bg/40 text-game-bg hover:bg-game-bg/15 hover:text-game-bg focus-visible:ring-game-bg"
                >
                  Comment jouer
                </Button>
              }
            />
            <GlossarySheet
              trigger={
                <Button
                  variant="ghost"
                  className="min-h-11 border border-game-bg/40 text-game-bg hover:bg-game-bg/15 hover:text-game-bg focus-visible:ring-game-bg"
                >
                  Glossaire Nouchi
                </Button>
              }
            />
          </div>

          {/* Pitch complet : panneau sombre pour lisibilité + nouchi surligné */}
          <p className="game-panel mt-10 max-w-2xl rounded-xl p-4 text-sm leading-relaxed text-game-text/90 shadow-xl sm:text-base">
            <NouchiText text={INTRO_TEXT} />
          </p>
        </div>
      </section>

      {/* ——— Mini-cards mécaniques ——— */}
      <section
        aria-labelledby="mechanics-title"
        className="bg-game-bg text-game-text"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 id="mechanics-title" className="sr-only">
            Trois mécaniques du jeu
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {MECHANICS.map(({ icon: Icon, color, title, text }) => (
              <li key={title}>
                <div className="game-panel border-tricolore h-full rounded-xl p-5">
                  <span
                    className="flex size-10 items-center justify-center rounded-lg bg-game-bg/60"
                    aria-hidden="true"
                  >
                    <Icon className={`size-5 ${color}`} />
                  </span>
                  <h3 className="mt-3 text-base font-bold text-game-text">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-game-muted">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-game-muted">
            {GLOSSARY.length} mots de nouchi à découvrir dans le glossaire. On a
            mis le pays !
          </p>
        </div>
      </section>
    </div>
  );
}
