# TEAM_STATUS — VISIBILITÉ DE L'AVANCEMENT

> Mis à jour à chaque évolution majeure. Dernière mise à jour : **T-023 — Avatar personnalisable (coiffure/peau) + fallback voix serveur (kazi)**

## 🟢 ÉTAT GLOBAL : FEAT-001 LIVRÉE (boucle de jeu complète validée E2E) — commits en cours (T-019) puis AUDIT-002 clôturé

## Agent par agent

| Agent | Statut | Dernière tâche | Prochaine action |
|---|---|---|---|
| AGENT 1 — Tech Lead | 🟢 Actif | Specs + game core + correctif moteur (LL-005) | Clôture T-019/T-020 |
| AGENT 2 — PM/QA | 🟢 Actif | T-016 : E2E gold path complet du jeu | Rien — en veille produit |
| DEV FRONTEND (sous-agent) | ✅ Livré + Validé | T-014 : 16 composants du jeu, lint 0, tsc 0 | En veille |
| DEV BACKEND | ✅ Livré + Validé | T-013 : SaveGame + API save/load (DB vérifiée) | En veille |
| AGENT REVIEWER | ✅ Livré | T-017 : conforme (preuves grep HO-002) | En veille |
| AGENT DOCUMENTATION | ✅ Livré | README jeu + LESSONS_LEARNED (LL-005/006) | En veille |
| AGENT COMMIT | 🟡 En cours | T-019 : commits FEAT-001 | En cours |
| AGENT AUDIT GLOBAL | 🟡 En cours | AUDIT-002 rédigé (clôture après commits) | Clôture |
| UX/UI DESIGNER | ✅ Livré | Spec UX + supervision palette normative | En veille |
| PRODUCT OWNER | ✅ | T-010 débloquée (cahier des charges reçu) | Arbitrages suivants |

## Avancement des épopées

| Épopée | Avancement | Note |
|---|---|---|
| Gouvernance (T-001→T-003, T-005, T-009) | ██████████ 100 % | Dossier `.ai/` complet, commits propres |
| Normalisation P0 (T-004, T-006→T-008) | ██████████ 100 % | Validée (HO-001) |
| **FEAT-001 Abidjan Hustle (T-010→T-018)** | ██████████ 100 % | Boucle de jeu complète E2E — missions M1→M3, tontine, dash, nouchi, cloud save |
| DevOps FEAT-001 (T-019) | ████████░░ 80 % | Commits en cours |
| Audit (T-020) | ████████░░ 80 % | AUDIT-002 rédigé |
| **Voix onboarding (T-021, FEATURE-002)** | ██████████ 100 % | Pivot T-021b : Web Speech API `fr-FR` native navigateur (latence nulle, 0 serveur) — spec `.ai/SPECS/FEATURE-002_VOICE.md` |
| Présentation inspirations (T-022) | ██████████ 100 % | Section « Nos inspirations » sur le menu : **GTA V** (monde ouvert, missions variées, humour noir) + **The Sims** (gestion du quotidien, relations sociales) — formulations utilisateur conservées verbatim |
| **Avatar + voix v2 (T-023, FEATURE-003)** | ██████████ 100 % | Avatar SVG (6 coiffures × 4 peaux × 3 tenues) preview création + HUD ; save v2 + migration v1 prouvée (save injectée → defaults) ; fallback voix serveur `kazi` validé E2E (POST 200 → lecture → toggle stop) — specs FEATURE-003 + FEATURE-002 §10 |
| **Personnage AAA (T-024, FEATURE-004)** | ██████████ 100 % | Avatar v2 semi-réaliste pleine silhouette (gradients peau/jean/cuir, visage expressif) ; 6 coiffures × 4 barbes × 4 peaux × **4 tenues à paliers** (debutant→streetwear→bomber→costard, pagne supprimé cf. master prompt §8) ; **5 expressions** pilotées par le moral (HUD) + test d'humeur à la création ; 2 planches concept art IA ; save v3 + migration pagne→debutant ; fix zod (hair/skin/beard persistés au cloud, 200 + row vérifiée `Zézé/v3/bouc`) — spec FEATURE-004 |

## Preuves QA FEAT-001 (règle anti-menterie)

- `bun run lint` : 0 erreur · `bunx tsc --noEmit` : 0 erreur `src/`
- E2E Agent Browser (gold path joué jusqu'à M1 done) : création → intro nouchi → transports (pied/Gbaka) → djossi (gains aléatoires réels) → events police (dash 1 100 F ; tchatche succès ET échec observés) → ambulant → achat matelas → M1 step 0→1→done (+300 F, +5 rep) → **J+1 exact après correctif LL-005** → résumé journalier avec chiffres exacts (+3 650/−5 650)
- Cloud save : row SQLite vérifiée (`Zézé`, 2 029 octets) ; load deviceId inconnu → `{ok, save:null}` sans 500
- Mobile 390 px : 0 débordement, footer poussé naturellement ; desktop 1280 px 3 colonnes ; 0 erreur console
- Revue : 0 fetch dans les composants, 0 mutation moteur importée par l'UI, `shared/` sans logique de jeu

## Bloquants & dépendances

1. ⚠️ R-004 (nouveau) — équilibrage dash vs gains débutant : à ajuster après premiers retours testeurs.
2. R-001/R-002 inchangés (compensés/documentés).

## Faits marquants du jour

- Cahier des charges « Abidjan Hustle » reçu → adapté en Vertical Slice Web (ADR-003), livré et validé en une session.
- Le sous-agent frontend a détecté un bug moteur critique (double saut de jour) → corrigé et re-vérifié (LL-005).
- T-021b : pivot voix → Web Speech API (`fr-FR` natif navigateur) après retour utilisateur (le SDK TTS ne rendait pas le français) ; route SDK supprimée, latence nulle, LL-007 consignée.
