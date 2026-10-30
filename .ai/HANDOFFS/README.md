# HANDOFFS — Transferts entre agents

Chaque transfert de responsabilité entre agents est tracé ici (règle TEAM_ARCHITECTURE §3.2).

## Format

```
## HO-XXX — <titre>
- De : <agent sortant> → Vers : <agent entrant>
- Date : ...
- Contexte : ...
- Livrables transmis : ...
- Points d'attention : ...
- Clôture réception : <date + agent entrant>
```

## Journal

### HO-001 — T-004 livré par DEV FRONTEND → AGENT REVIEWER (T-007)
- De : DEV FRONTEND + AGENT UX/UI DESIGNER → Vers : AGENT REVIEWER
- Date : 2026-10-30
- Contexte : normalisation P0 (layout racine, header/footer sticky, page d'accueil, globals.css).
- Livrables transmis : `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/components/shared/layout/Header.tsx`, `src/components/shared/layout/Footer.tsx`, `.gitkeep` (`shared/common/`, `guest/`).
- Points d'attention (transmis par le dev) :
  1. Nav header = ancres `/#stack`, `/#statut` → à migrer en vraies routes à la première feature.
  2. Version `v0.2.1` en dur dans Header et Footer (dette D-002).
  3. Année copyright figée au build (prerender statique) — sans impact immédiat.
  4. `<img>` pour le SVG (optimiseur Next 400 sinon) — LL-001.
- Clôture réception : **2026-10-30 — AGENT REVIEWER (T-007)**. Verdict : APPROUVÉ AVEC RÉSERVES.
  Réserves traitées le même jour et re-vérifiées (Agent Browser) :
  - MAJ-01 corrigé : media query `prefers-reduced-motion` ajoutée **dans** `public/logo.svg` + commentaire globals.css rectifié.
  - MIN-01 corrigé : labels de nav courts en mobile (`sm:hidden` / `hidden sm:inline`) + masquage du texte de marque < 400px → 0 débordement horizontal à 320/390/768px.
  - MIN-02 documenté (commentaire explicite dans Footer.tsx, cf. LL-003/D-002).
  - Suggestions appliquées : `tabIndex={-1}` sur `<main>`, `alt=""` sur le logo du hero.
  - Suggestion BrandMark factorisé : reportée volontairement (dette D-002, décision Tech Lead).
