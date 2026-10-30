# ADR-003 — Adapter « Abidjan Hustle » en Vertical Slice Web (Next.js) au lieu d'UE5

- **Statut :** ✅ Accepté
- **Date :** 2026-10-30
- **Décideurs :** AGENT 1 (Tech Lead), validé par AGENT 2 (QA/PO) et le PRODUCT OWNER (utilisateur)
- **Contexte :** le cahier des charges (GDD v2) cible Unreal Engine 5, équipe de 6+ personnes, 60 semaines, Git LFS/Perforce. L'environnement projet réel est un sandbox **Next.js 16 (page unique `/`, Prisma/SQLite, Tailwind/shadcn)**. Le GDD lui-même recommande de *« commencer petit… un quartier… la qualité des dialogues, l'humour, le Système D »*.

## Décision
1. Réaliser un **Vertical Slice jouable dans le navigateur** : quartier unique Yopougon, moteur de vie (jauges, temps), missions scriptées, économie FCFA, dialogues nouchi + glossaire, tontine, transports, événements locaux (CIE, microbes, dash).
2. **Stack** : game core **pur et testable** (`src/lib/game/`) + Zustand persist (localStorage) + UI React/shadcn dans `src/components/guest/` + cloud save 1-slot anonyme (Prisma/SQLite). Aucun moteur 3D, aucun asset audio.
3. Le GDD (10 modules, 54 US) devient la **roadmap produit** de référence dans `.ai/` ; seules les US équivalentes web sont prises (F-01→F-17 de FEATURE-001_SPEC).
4. Contrainte d'environnement assumée : le jeu vit sur la route unique `/` (state machine d'écrans en client component).

## Alternatives écartées
- UE5/Unity : impossible dans l'environnement (aucun runtime, aucun pipeline build).
- Attendre une stack 3D : contredit la règle « stack déduite des fichiers présents » et la recommandation du GDD.
- Jeu multi-pages : interdit par la contrainte « user can only see / ».

## Conséquences
- Mécaniques = constantes de données centralisées (équilibrage sans refonte) → portable vers UE5 (Data Assets) plus tard.
- La palette chromatique du cahier des charges est **normative** (tokens CSS `--game-*`).
- Scope exact : FEATURE-001_SPEC F-01→F-17 ; tout le reste est roadmap (S8.x GDD).
