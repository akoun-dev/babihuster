"use client";

/**
 * Écran CRÉATION DE PERSONNAGE — acteur : JOUEUR (guest).
 *
 * Personnalisation complète du môgô (T-023, FEATURE-003) : nom (1–20),
 * coiffure (HAIRSTYLES), teinte de peau (SKIN_TONES), tenue de départ
 * (OUTFITS). Preview live via le composant Avatar (SVG). Validation au
 * clic de lancement ; `newGame(name, outfit, hair, skin)` du store fait
 * le reste.
 */

import { useState } from "react";
import { ArrowLeft, Rocket, Scissors } from "lucide-react";
import { HAIRSTYLES, INTRO_TEXT, OUTFITS, SKIN_TONES } from "@/lib/game/data";
import type { HairId, Outfit, SkinId } from "@/lib/game/types";
import { useGame } from "@/lib/game/store";
import { Avatar } from "@/components/guest/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NouchiText } from "@/components/guest/NouchiText";
import { VoiceButton } from "@/components/guest/VoiceButton";

export function CharacterCreation() {
  const setScreen = useGame((s) => s.setScreen);
  const newGame = useGame((s) => s.newGame);

  const [name, setName] = useState("");
  const [hair, setHair] = useState<HairId>("coupe");
  const [skin, setSkin] = useState<SkinId>("cafe");
  const [outfit, setOutfit] = useState<Outfit>("pagne");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Ton nom, môgô — même un surnom de quartier ! (1 à 20 caractères)");
      return;
    }
    setError(null);
    newGame(trimmed, outfit, hair, skin);
  }

  return (
    <div className="bg-game-bg text-game-text">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
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
          {/* ——— Preview live : ton môgô ——— */}
          <div className="game-panel border-tricolore mx-auto flex w-full max-w-xs flex-col items-center gap-2 rounded-xl p-4">
            <div className="w-40">
              <Avatar
                hair={hair}
                outfit={outfit}
                skin={skin}
                label={`Portrait de ton personnage ${name.trim()}`.trim()}
              />
            </div>
            <p aria-live="polite" className="text-center text-sm text-game-muted">
              {name.trim()
                ? `Prêt à prendre le pays, ${name.trim()} !`
                : "Personnalise ton môgô ci-dessous."}
            </p>
          </div>

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

          {/* ——— Tenue (radio-cards) ——— */}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-semibold text-game-text">
              Ta tenue de départ
            </legend>
            <RadioGroup
              value={outfit}
              onValueChange={(v) => setOutfit(v as Outfit)}
              className="grid gap-3 sm:grid-cols-3"
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
                    <span className="block text-sm font-bold text-game-text">
                      {o.label}
                    </span>
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
