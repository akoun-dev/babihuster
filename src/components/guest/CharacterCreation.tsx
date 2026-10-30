"use client";

/**
 * Écran CRÉATION DE PERSONNAGE — acteur : JOUEUR (guest).
 *
 * Personnalisation complète du môgô (T-024, FEATURE-004 « Personnage AAA ») :
 * nom (1–20), coiffure (HAIRSTYLES), barbe (BEARDS), teinte de peau
 * (SKIN_TONES), tenue par palier (OUTFITS) + test d'expressions (MOODS,
 * master prompt §6.6). Preview live via Avatar v2 (silhouette semi-réaliste)
 * + planche concept art IA (« vision studio »). `newGame(name, outfit, hair,
 * skin, beard)` du store fait le reste.
 */

import { useState } from "react";
import Image from "next/image";
import {
  Angry,
  ArrowLeft,
  Flame,
  Laugh,
  Rocket,
  Scissors,
  Smile,
  Zap,
} from "lucide-react";
import { BEARDS, HAIRSTYLES, INTRO_TEXT, MOODS, OUTFITS, SKIN_TONES } from "@/lib/game/data";
import type { BeardId, HairId, MoodId, Outfit, SkinId } from "@/lib/game/types";
import { useGame } from "@/lib/game/store";
import { Avatar } from "@/components/guest/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NouchiText } from "@/components/guest/NouchiText";
import { VoiceButton } from "@/components/guest/VoiceButton";

/** Icônes des chips d'expression (test d'humeur). */
const ICONES_MOOD = {
  neutre: Smile,
  heureux: Laugh,
  determine: Flame,
  surpris: Zap,
  contrarie: Angry,
} as const;

export function CharacterCreation() {
  const setScreen = useGame((s) => s.setScreen);
  const newGame = useGame((s) => s.newGame);

  const [name, setName] = useState("");
  const [hair, setHair] = useState<HairId>("coupe");
  const [skin, setSkin] = useState<SkinId>("cafe");
  const [outfit, setOutfit] = useState<Outfit>("debutant");
  const [beard, setBeard] = useState<BeardId>("aucune");
  const [mood, setMood] = useState<MoodId>("neutre");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Ton nom, môgô — même un surnom de quartier ! (1 à 20 caractères)");
      return;
    }
    setError(null);
    newGame(trimmed, outfit, hair, skin, beard);
  }

  return (
    <div className="bg-game-bg text-game-text">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Button
          variant="ghost"
          onClick={() => setScreen("menu")}
          className="min-h-11 text-game-muted hover:bg-game-panel hover:text-game-text"
        >
          <ArrowLeft aria-hidden="true" />
          Retour au menu
        </Button>

        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
          Crée ton môgô
        </h1>
        <div className="game-panel mt-4 rounded-xl p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-game-muted">
              Ton histoire
            </span>
            <VoiceButton text={INTRO_TEXT} srLabel="de ton histoire" />
          </div>
          <p className="text-sm leading-relaxed text-game-text/90">
            <NouchiText text={INTRO_TEXT} />
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
          {/* ——— Preview live : ton môgô + art conceptuel ——— */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="game-panel border-tricolore flex flex-col items-center gap-3 rounded-xl p-4">
              <div className="w-40 sm:w-44">
                <Avatar
                  hair={hair}
                  outfit={outfit}
                  skin={skin}
                  beard={beard}
                  mood={mood}
                  label={`Silhouette de ton personnage ${name.trim()}`.trim()}
                />
              </div>
              <p aria-live="polite" className="text-center text-sm text-game-muted">
                {name.trim()
                  ? `Prêt à prendre le pays, ${name.trim()} !`
                  : "Personnalise ton môgô ci-dessous."}
              </p>
            </div>

            <div className="game-panel flex flex-col overflow-hidden rounded-xl">
              <div className="relative min-h-0 flex-1">
                <Image
                  src="/images/character/mogo-hero.png"
                  alt="Art conceptuel du personnage principal : jeune homme ivoirien en bomber sombre, tee blanc, chaîne en or, jean déchiré et boots"
                  width={768}
                  height={1344}
                  className="h-full max-h-80 w-full object-cover object-top sm:max-h-none"
                  priority={false}
                />
              </div>
              <p className="border-t border-game-text/10 px-3 py-2 text-center text-xs text-game-muted">
                Art conceptuel — la vision studio de ton môgô
              </p>
            </div>
          </div>

          {/* ——— Test d'humeur (expressions, master prompt §6.6) ——— */}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-semibold text-game-text">
              Teste son humeur
            </legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Prévisualiser les expressions">
              {MOODS.map((m) => {
                const Icone = ICONES_MOOD[m.id];
                const actif = mood === m.id;
                return (
                  <Button
                    key={m.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMood(m.id)}
                    aria-pressed={actif}
                    className={
                      actif
                        ? "min-h-9 border-game-soleil bg-game-panel/70 text-game-soleil"
                        : "min-h-9 border-game-text/15 bg-transparent text-game-muted hover:bg-game-panel hover:text-game-text"
                    }
                  >
                    <Icone aria-hidden="true" />
                    {m.label}
                  </Button>
                );
              })}
            </div>
          </fieldset>

          {/* ——— Nom ——— */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="player-name" className="text-game-text">
              Ton nom (1–20 caractères)
            </Label>
            <Input
              id="player-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              maxLength={20}
              placeholder="Ex : Junior, Gnamankoudji, Le Patron…"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "player-name-error" : undefined}
              className="min-h-12 border-game-text/15 bg-game-panel text-base text-game-text placeholder:text-game-muted/70 focus-visible:ring-game-soleil/50"
            />
            {error && (
              <p
                id="player-name-error"
                role="alert"
                className="text-sm font-medium text-game-alerte"
              >
                {error}
              </p>
            )}
          </div>

          {/* ——— Coiffure (radio-cards) ——— */}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-game-text">
              <Scissors className="size-4 text-game-soleil" aria-hidden="true" />
              Ta coiffure
            </legend>
            <RadioGroup
              value={hair}
              onValueChange={(v) => setHair(v as HairId)}
              className="grid gap-3 sm:grid-cols-3"
              aria-label="Choix de la coiffure"
            >
              {HAIRSTYLES.map((h) => (
                <Label
                  key={h.id}
                  htmlFor={`hair-${h.id}`}
                  className="game-panel group relative flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors has-[button[data-state=checked]]:bg-game-panel/70"
                  style={
                    hair === h.id
                      ? { borderColor: h.color, boxShadow: `0 0 0 1px ${h.color}` }
                      : undefined
                  }
                >
                  <RadioGroupItem
                    id={`hair-${h.id}`}
                    value={h.id}
                    className="mt-0.5 border-game-muted text-game-soleil focus-visible:ring-game-soleil/50 data-[state=checked]:border-game-soleil"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-bold text-game-text">
                      <span
                        aria-hidden="true"
                        className="size-3 shrink-0 rounded-full ring-1 ring-black/30"
                        style={{ backgroundColor: h.color }}
                      />
                      {h.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-game-muted">
                      {h.desc}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          {/* ——— Barbe (radio-cards) ——— */}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-semibold text-game-text">
              Ta barbe
            </legend>
            <RadioGroup
              value={beard}
              onValueChange={(v) => setBeard(v as BeardId)}
              className="grid gap-3 sm:grid-cols-2"
              aria-label="Choix de la barbe"
            >
              {BEARDS.map((b) => (
                <Label
                  key={b.id}
                  htmlFor={`beard-${b.id}`}
                  className="game-panel group relative flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors has-[button[data-state=checked]]:bg-game-panel/70"
                  style={
                    beard === b.id
                      ? { borderColor: "#8A6F4D", boxShadow: "0 0 0 1px #8A6F4D" }
                      : undefined
                  }
                >
                  <RadioGroupItem
                    id={`beard-${b.id}`}
                    value={b.id}
                    className="mt-0.5 border-game-muted text-game-soleil focus-visible:ring-game-soleil/50 data-[state=checked]:border-game-soleil"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-game-text">{b.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-game-muted">
                      {b.desc}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          {/* ——— Teinte de peau (pastilles) ——— */}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-semibold text-game-text">
              Ta teinte de peau
            </legend>
            <RadioGroup
              value={skin}
              onValueChange={(v) => setSkin(v as SkinId)}
              className="flex flex-wrap gap-3"
              aria-label="Choix de la teinte de peau"
            >
              {SKIN_TONES.map((t) => (
                <Label
                  key={t.id}
                  htmlFor={`skin-${t.id}`}
                  className="flex cursor-pointer flex-col items-center gap-1.5"
                >
                  <RadioGroupItem
                    id={`skin-${t.id}`}
                    value={t.id}
                    className="size-11 rounded-full border-2 border-transparent p-0 focus-visible:ring-game-soleil/50 data-[state=checked]:border-game-soleil data-[state=checked]:ring-2 data-[state=checked]:ring-game-soleil/40"
                    style={{ backgroundColor: t.color }}
                    aria-label={`Peau ${t.label}`}
                  />
                  <span className="text-xs font-medium text-game-muted">{t.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          {/* ——— Tenue par palier (radio-cards) ——— */}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-semibold text-game-text">
              Ta tenue de départ
            </legend>
            <RadioGroup
              value={outfit}
              onValueChange={(v) => setOutfit(v as Outfit)}
              className="grid gap-3 sm:grid-cols-2"
              aria-label="Choix de la tenue de départ"
            >
              {OUTFITS.map((o) => (
                <Label
                  key={o.id}
                  htmlFor={`outfit-${o.id}`}
                  className="game-panel group relative flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors has-[button[data-state=checked]]:bg-game-panel/70"
                  style={
                    outfit === o.id
                      ? { borderColor: o.color, boxShadow: `0 0 0 1px ${o.color}` }
                      : undefined
                  }
                >
                  <RadioGroupItem
                    id={`outfit-${o.id}`}
                    value={o.id}
                    className="mt-0.5 border-game-muted text-game-soleil focus-visible:ring-game-soleil/50 data-[state=checked]:border-game-soleil"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-game-text">{o.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-game-muted">
                      {o.desc}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-2 block h-1.5 w-10 rounded-full"
                      style={{ backgroundColor: o.color }}
                    />
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <Button
            type="submit"
            size="lg"
            className="min-h-12 bg-game-soleil text-base font-bold text-black hover:bg-game-soleil/90"
          >
            <Rocket aria-hidden="true" />
            Commencer l’aventure
          </Button>
        </form>
      </div>
    </div>
  );
}
