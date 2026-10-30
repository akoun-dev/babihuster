#!/usr/bin/env python3
"""
Générateur du fichier central de suivi TASKS.xlsx — Système Multi-Agents.
Règle du projet : ce script est la source de vérité structurelle du classeur.
Réexécutable sans risque (recrée le fichier à l'identique).
"""
import sys, os

XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)

from templates.base import (
    setup_sheet, style_header_row, style_data_row, style_total_row,
    font_caption,
    CF_POSITIVE_FILL, CF_POSITIVE_FONT, CF_NEGATIVE_FILL, CF_NEGATIVE_FONT,
    CF_WARNING_FILL, CF_WARNING_FONT,
)
from openpyxl import Workbook
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment

OUT = "/home/z/my-project/.ai/TASKS.xlsx"
TODAY = "2026-10-30"

wb = Workbook()
wb.properties.creator = "Z.ai"

# ============================================================
# Feuille 1 — TÂCHES
# ============================================================
ws = wb.active
ws.title = "Tâches"
HEADERS_T = ["ID", "Épopée / Feature", "Description", "Agent responsable",
             "Priorité", "Statut", "Progression", "Date début", "Date fin",
             "Livrables", "Validation QA", "Notes"]
LAST_COL_T = 1 + len(HEADERS_T)  # data starts at col B (2)

setup_sheet(ws, title="TABLEAU CENTRAL DE SUIVI — SYSTÈME MULTI-AGENTS", last_col=LAST_COL_T)
for c, h in enumerate(HEADERS_T, 2):
    ws.cell(row=4, column=c, value=h)
style_header_row(ws, 4, 2, LAST_COL_T)

tasks = [
    ["T-001", "Gouvernance", "Analyse complète du projet (structure, stack, docs, risques)", "AGENT 1 — Tech Lead", "P0", "Terminé", 1.0, TODAY, TODAY, "Rapport d'audit initial (.ai/AUDITS/)", "OUI", "Scaffold Next.js 16 vierge"],
    ["T-002", "Gouvernance", "Identification des acteurs et matrice des permissions", "AGENT 1 + AGENT 2", "P0", "Terminé", 1.0, TODAY, TODAY, ".ai/ACTORS.md", "OUI", "Seul acteur actuel : VISITEUR (Guest)"],
    ["T-003", "Gouvernance", "Mise en place du dossier de pilotage .ai/", "AGENT 1 — Tech Lead", "P0", "Terminé", 1.0, TODAY, TODAY, ".ai/ (gouvernance, ADR, SPECS)", "OUI", ""],
    ["T-004", "Normalisation", "Layout racine + header + footer sticky + page d'accueil normalisée", "DEV FRONTEND (styling-expert)", "P0", "Terminé", 1.0, TODAY, TODAY, "layout.tsx, page.tsx, shared/layout/", "OUI", "Lint clean, build statique OK, revue T-007 validée"],
    ["T-005", "Gouvernance", "Création du fichier central TASKS.xlsx", "AGENT 2 — QA/PO", "P0", "Terminé", 1.0, TODAY, TODAY, ".ai/TASKS.xlsx", "OUI", "6 feuilles de pilotage"],
    ["T-006", "Documentation", "README.md racine (stack, conventions, pilotage)", "AGENT DOCUMENTATION", "P1", "Terminé", 1.0, TODAY, TODAY, "README.md", "OUI", ""],
    ["T-007", "Qualité", "Revue de code indépendante du livrable T-004", "AGENT REVIEWER", "P1", "Terminé", 1.0, TODAY, TODAY, "Rapport de revue (HANDOFFS HO-001)", "OUI", "Verdict : approuvé avec réserves — MAJ-01/MIN-01 corrigés puis re-vérifiés"],
    ["T-008", "Qualité", "Vérification E2E navigateur (rendu + interactions)", "AGENT 2 — QA", "P1", "Terminé", 1.0, TODAY, TODAY, "Constat E2E (TEAM_STATUS.md)", "OUI", "Footer sticky prouvé 844/844 ; 0 débordement 320/390/768px ; ancres OK"],
    ["T-009", "DevOps", "Commit normalisé de la gouvernance + normalisation P0", "AGENT COMMIT", "P1", "Terminé", 1.0, TODAY, TODAY, "3 commits conventionnels (chore/feat/docs) + clôture", "OUI", "db/, upload/, .zscripts/, skills/, download/ exclus du git"],
    ["T-010", "Produit", "Cahier des charges : REÇU (GDD Abidjan Hustle + backlog + palette)", "PRODUCT OWNER", "P0", "Terminé", 1.0, TODAY, TODAY, "Cahier des charges utilisateur (chat)", "OUI", "Débloque FEAT-001 — scope adapté en Vertical Slice Web (ADR-003)"],
    ["T-011", "FEAT-001 · Phase 0-3", "Specs UX/SPEC/TECH + ADR-003 + matrice acteurs", "AGENT 1 + AGENT 2 + UX", "P0", "Terminé", 1.0, TODAY, TODAY, ".ai/SPECS/FEATURE-001_*.md, ADR-003, ACTORS.md", "OUI", "Validation UX par AGENT 2 acquise"],
    ["T-012", "FEAT-001 · Phase 4", "Game core pur : types, data (Yopougon, nouchi, missions), moteur, store", "AGENT 1 / DEV FULLSTACK", "P0", "Terminé", 1.0, TODAY, TODAY, "src/lib/game/** (4 modules)", "OUI (E2E)", "Bug double-jour détecté puis corrigé (LL-005)"],
    ["T-013", "FEAT-001 · Phase 4", "Backend cloud save : Prisma SaveGame + API save/load (zod)", "DEV BACKEND", "P0", "Terminé", 1.0, TODAY, TODAY, "schema.prisma + /api/game/save + /api/game/load", "OUI (DB row vérifiée)", "1 slot anonyme par deviceId ; jamais de 500 sur absence"],
    ["T-014", "FEAT-001 · Phase 4", "UI du jeu : 16 composants guest/ + page unique + thème --game-*", "DEV FRONTEND (sous-agent)", "P0", "Terminé", 1.0, TODAY, TODAY, "src/components/guest/**, page.tsx, Header/Footer, globals.css", "En attente revue → faite", "Lint 0, tsc 0 ; footer sticky intouché"],
    ["T-015", "FEAT-001 · Phase 5", "Intégration + correctif moteur + lint/tsc", "AGENT 1", "P0", "Terminé", 1.0, TODAY, TODAY, "engine.ts corrigé (LL-005)", "OUI", "J1→J2 exact ; stats résumé exactes"],
    ["T-016", "FEAT-001 · Phase 5", "E2E navigateur : gold path complet du jeu", "AGENT 2 — QA", "P0", "Terminé", 1.0, TODAY, TODAY, "Parcours vérifié jusqu'à M1 done + cloud save DB + mobile 390px", "OUI", "0 erreur console ; 0 débordement ; events, tontine, missions OK"],
    ["T-017", "FEAT-001 · Phase 5", "Revue indépendante (checklist greps + qualifications)", "AGENT REVIEWER", "P1", "Terminé", 1.0, TODAY, TODAY, "HO-002 (preuves grep)", "OUI", "0 fetch UI ; mutations store uniquement ; shared sans logique jeu"],
    ["T-018", "FEAT-001 · Phase 6", "Documentation finale (README jeu, journal, lessons)", "AGENT DOCUMENTATION", "P1", "Terminé", 1.0, TODAY, TODAY, "README.md + LESSONS_LEARNED + HANDOFFS", "OUI", ""],
    ["T-019", "FEAT-001 · Phase 6", "Commits conventionnels FEAT-001", "AGENT COMMIT", "P1", "Terminé", 1.0, TODAY, TODAY, "feat(game) + feat(game-ui) + docs", "OUI", "3 commits atomiques ; commit UUID ff6b21e = automatisation sandbox (anodin, documenté AUDIT-002)"],
    ["T-020", "FEAT-001 · Phase 7-8", "AUDIT-002 + rétrospective + rapport final", "AGENT AUDIT GLOBAL", "P1", "Terminé", 1.0, TODAY, TODAY, ".ai/AUDITS/AUDIT-002-FEAT-001.md + rapport", "OUI", "FEAT-001 : Validé — livré ; lessons LL-005/006 intégrées"],
]
DATA_START = 5
for i, row in enumerate(tasks):
    r = DATA_START + i
    for c, v in enumerate(row, 2):
        ws.cell(row=r, column=c, value=v)
    style_data_row(ws, r, 2, LAST_COL_T, i)
    # formats spécifiques
    ws.cell(row=r, column=8).number_format = "0%"
    for col in (9, 10):
        ws.cell(row=r, column=col).alignment = Alignment(horizontal="left", vertical="center")
LAST_ROW_T = DATA_START + len(tasks) - 1

# Ligne de synthèse (valeurs calculées — vérification programmatique)
total_row = LAST_ROW_T + 1
ws.cell(row=total_row, column=2, value="SYNTHÈSE")
done = sum(1 for t in tasks if t[5] == "Terminé")
ws.cell(row=total_row, column=3, value=f"Total : {len(tasks)} tâches")
ws.cell(row=total_row, column=7, value=f"{done}/{len(tasks)} terminées")
prog = sum(t[6] for t in tasks) / len(tasks)
ws.cell(row=total_row, column=8, value=round(prog, 2))
ws.cell(row=total_row, column=8).number_format = "0%"
style_total_row(ws, total_row, 2, LAST_COL_T)

# Notes
note_r = total_row + 2
ws.cell(row=note_r, column=2, value="Statuts autorisés : À faire / En cours / En revue / Terminé / Bloqué. Priorités : P0 > P1 > P2. Source : .ai/GOVERNANCE.md")
ws.cell(row=note_r, column=2).font = font_caption()

# Mise en forme conditionnelle sur Statut (col G)
rng = f"G{DATA_START}:G{LAST_ROW_T}"
ws.conditional_formatting.add(rng, FormulaRule(formula=[f'$G{DATA_START}="Terminé"'], fill=CF_POSITIVE_FILL, font=CF_POSITIVE_FONT))
ws.conditional_formatting.add(rng, FormulaRule(formula=[f'OR($G{DATA_START}="En cours",$G{DATA_START}="En revue")'], fill=CF_WARNING_FILL, font=CF_WARNING_FONT))
ws.conditional_formatting.add(rng, FormulaRule(formula=[f'$G{DATA_START}="Bloqué"'], fill=CF_NEGATIVE_FILL, font=CF_NEGATIVE_FONT))

ws.freeze_panes = "C5"
ws.auto_filter.ref = f"B4:M{LAST_ROW_T}"

# ============================================================
# Feuille 2 — FEATURES (lifecycle 0-8)
# ============================================================
ws2 = wb.create_sheet("Features")
HEADERS_F = ["ID Feature", "Nom", "Phase lifecycle (0-8)", "Spec UX", "Spec fonctionnelle",
             "Design technique", "Découpage/Plan", "Owner", "Statut", "Notes"]
LAST_COL_F = 1 + len(HEADERS_F)
setup_sheet(ws2, title="SUIVI DU CYCLE DE VIE DES FONCTIONNALITÉS (PHASES 0→8)", last_col=LAST_COL_F)
for c, h in enumerate(HEADERS_F, 2):
    ws2.cell(row=4, column=c, value=h)
style_header_row(ws2, 4, 2, LAST_COL_F)

features = [
    ["FEAT-001", "Abidjan Hustle — Le Rêve Ivoirien (Vertical Slice Web)", "8 — Audit global clôturé", ".ai/SPECS/FEATURE-001_UX.md (validée AGENT 2)", ".ai/SPECS/FEATURE-001_SPEC.md (F-01→F-17)", ".ai/SPECS/FEATURE-001_TECH.md + ADR-003", "T-011→T-020 (TASKS)", "AGENT 1 + équipe", "Validé — livré", "AUDIT-002 clôturé ; boucle E2E complète"],
]
for i, row in enumerate(features):
    r = 5 + i
    for c, v in enumerate(row, 2):
        ws2.cell(row=r, column=c, value=v)
    style_data_row(ws2, r, 2, LAST_COL_F, i)
n2 = 5 + len(features) + 1
ws2.cell(row=n2, column=2, value="Phases : 0 Conception UX/UI → 1 Spécification → 2 Design technique → 3 Découpage → 4 Implémentation → 5 Revue/Tests → 6 Validation/Doc → 7 Rétrospective → 8 Audit global")
ws2.cell(row=n2, column=2).font = font_caption()
ws2.freeze_panes = "C5"

# ============================================================
# Feuille 3 — ÉQUIPE
# ============================================================
ws3 = wb.create_sheet("Équipe")
HEADERS_E = ["Agent", "Rôle", "Responsabilités principales", "Modalité d'exécution", "Statut"]
LAST_COL_E = 1 + len(HEADERS_E)
setup_sheet(ws3, title="ÉQUIPE VIRTUELLE MULTI-AGENTS — RÔLES ET STATUT", last_col=LAST_COL_E)
for c, h in enumerate(HEADERS_E, 2):
    ws3.cell(row=4, column=c, value=h)
style_header_row(ws3, 4, 2, LAST_COL_E)

team = [
    ["AGENT 1", "Tech Lead & Architecte", "Supervision, découpage, architecture, revues finales", "Orchestrateur (direct)", "Actif"],
    ["AGENT 2", "Chef de projet technique / QA", "Backlog, specs, tests E2E, validation", "Orchestrateur (direct)", "Actif"],
    ["DEV BACKEND", "API & logique métier", "Endpoints, Prisma, sécurité serveur, performance", "Task (full-stack-developer)", "En veille"],
    ["DEV FRONTEND", "UI / UX / état client", "Composants, hooks, services, séparation par acteur", "Task (frontend-styling-expert)", "Actif (T-004)"],
    ["DEV FULLSTACK/DATA", "Migrations, ORM, modèles", "Schéma Prisma, scripts, intégrations", "Task (full-stack-developer)", "En veille"],
    ["DEVOPS", "CI/CD, environnement", "Lint, builds, scripts, gateway", "Orchestrateur (direct)", "En veille"],
    ["DEV SÉCURITÉ", "Audit sécurité", "Secrets, injection, XSS/CSRF, dépendances", "Task (Explore/general-purpose)", "En veille"],
    ["AGENT COMMIT", "Git", "Commits conventionnels atomiques", "Orchestrateur (direct)", "Actif"],
    ["AGENT REVIEWER", "Revue indépendante", "Qualité, patterns, séparation par acteur", "Task (general-purpose)", "En veille"],
    ["AGENT DOCUMENTATION", "Tech writer", "README, ADR, guides, changelog", "Orchestrateur (direct)", "Actif (T-006)"],
    ["AGENT ACCESSIBILITÉ", "a11y WCAG", "Clavier, ARIA, contrastes", "Contrôle E2E + revue", "En veille"],
    ["AGENT PERFORMANCE", "Perf Web", "Bundle, lazy loading, Core Web Vitals", "Contrôle build/lint", "En veille"],
    ["AGENT UX/UI DESIGNER", "Design system", "Wireframes, user flows par acteur", "Task (frontend-styling-expert)", "Actif (T-004)"],
    ["AGENT AUDIT GLOBAL", "Audit transversal", "Dette, conformité, cohérence, auto-audit", "Task (Explore)", "Actif (audit initial)"],
]
for i, row in enumerate(team):
    r = 5 + i
    for c, v in enumerate(row, 2):
        ws3.cell(row=r, column=c, value=v)
    style_data_row(ws3, r, 2, LAST_COL_E, i)
ws3.freeze_panes = "C5"

# ============================================================
# Feuille 4 — AUDITS
# ============================================================
ws4 = wb.create_sheet("Audits")
HEADERS_A = ["ID", "Date", "Type", "Auditeur", "Constats clés", "Actions correctives", "Statut"]
LAST_COL_A = 1 + len(HEADERS_A)
setup_sheet(ws4, title="JOURNAL DES AUDITS", last_col=LAST_COL_A)
for c, h in enumerate(HEADERS_A, 2):
    ws4.cell(row=4, column=c, value=h)
style_header_row(ws4, 4, 2, LAST_COL_A)

audits = [
    ["AUDIT-001", TODAY, "Audit initial global", "AGENT AUDIT GLOBAL + AGENT 1",
     "Scaffold vierge ; aucune feature ; next-auth non configuré ; ignoreBuildErrors=true ; pas de README ; git scaffold untracked",
     "Gouvernance .ai/ créée ; normalisation P0 (layout/footer/a11y) ; README ; dette tracée (voir feuille Dette & Risques)",
     "Clôturé"],
]
for i, row in enumerate(audits):
    r = 5 + i
    for c, v in enumerate(row, 2):
        ws4.cell(row=r, column=c, value=v)
    style_data_row(ws4, r, 2, LAST_COL_A, i)
ws4.freeze_panes = "C5"

# ============================================================
# Feuille 5 — DETTE & RISQUES
# ============================================================
ws5 = wb.create_sheet("Dette & Risques")
HEADERS_D = ["ID", "Type", "Description", "Impact", "Probabilité", "Mitigation", "Responsable", "Statut"]
LAST_COL_D = 1 + len(HEADERS_D)
setup_sheet(ws5, title="REGISTRE DE DETTE TECHNIQUE ET DES RISQUES", last_col=LAST_COL_D)
for c, h in enumerate(HEADERS_D, 2):
    ws5.cell(row=4, column=c, value=h)
style_header_row(ws5, 4, 2, LAST_COL_D)

risks = [
    ["R-001", "Risque qualité", "next.config.ts : ignoreBuildErrors=true masque les erreurs TypeScript au build", "Moyen", "Élevée",
     "Vérifier `tsc --noEmit` à chaque livraison ; basculer à false après stabilisation", "AGENT 1", "Ouvert"],
    ["R-002", "Risque produit", "next-auth v4 installé mais non configuré — modèle d'acteurs à définir", "Élevé", "Certaine",
     "Décider du modèle d'authentification lors du premier cahier des charges (voir .ai/ACTORS.md)", "PRODUCT OWNER", "Ouvert"],
    ["R-003", "Risque environnement", "Avertissement cross-origin du serveur dev (preview sandbox) — allowedDevOrigins", "Faible", "Certaine",
     "Limité au sandbox ; documenté, aucune action bloquante", "DEVOPS", "Accepté"],
    ["R-004", "Risque équilibrage", "Dash de police (1 000-5 000 F) brutal vs gains de djossi (300-5 000 F) : peut ruiner un débutant en 2 contrôles", "Moyen", "Certaine",
     "Filet de sécurité F-13 en place ; ajuster dans data.ts au retour des premiers testeurs (consultants culturels)", "GAME DESIGN", "Ouvert"],
    ["D-001", "Dette data", "Schéma Prisma : modèle SaveGame ajouté ; User/Post scaffold conservés sans rôles", "Faible", "—",
     "Nettoyer User/Post lors de l'ajout d'une vraie authentification (R-002)", "DEV FULLSTACK/DATA", "Ouvert"],
    ["D-002", "Dette qualité", "Version centralisée dans app-config.ts (résolu FEAT-001) ; reste : BrandMark factorisable", "Faible", "—",
     "Factoriser le bloc logo lors de la prochaine évolution d'identité visuelle", "DEV FRONTEND", "Partiel"],
    ["D-003", "Dette jeu", "Reload pendant le résumé de jour : stats affichées dégradées (assumé, documenté HO-002)", "Faible", "—",
     "Migrer dayStats vers un journal dédié si les testeurs le signalent", "AGENT 1", "Ouvert"],
]
for i, row in enumerate(risks):
    r = 5 + i
    for c, v in enumerate(row, 2):
        ws5.cell(row=r, column=c, value=v)
    style_data_row(ws5, r, 2, LAST_COL_D, i)
rng5 = f"I5:I{4 + len(risks)}"
ws5.conditional_formatting.add(rng5, FormulaRule(formula=['$I5="Ouvert"'], fill=CF_WARNING_FILL, font=CF_WARNING_FONT))
ws5.conditional_formatting.add(rng5, FormulaRule(formula=['$I5="Accepté"'], fill=CF_POSITIVE_FILL, font=CF_POSITIVE_FONT))
ws5.freeze_panes = "C5"

# ============================================================
# Feuille 6 — JOURNAL
# ============================================================
ws6 = wb.create_sheet("Journal")
HEADERS_J = ["Date", "Agent", "Type", "Message"]
LAST_COL_J = 1 + len(HEADERS_J)
setup_sheet(ws6, title="JOURNAL DE BORD (STANDUPS, LEÇONS, DÉCISIONS)", last_col=LAST_COL_J)
for c, h in enumerate(HEADERS_J, 2):
    ws6.cell(row=4, column=c, value=h)
style_header_row(ws6, 4, 2, LAST_COL_J)

journal = [
    [TODAY, "PRODUCT OWNER", "Décision", "Système opérationnel et en attente du cahier des charges. AUCUNE feature ne sera inventée sans spécification utilisateur."],
    [TODAY, "PRODUCT OWNER", "Déblocage", "T-010 débloquée : cahier des charges « Abidjan Hustle » reçu (GDD, backlog 54 US, palette). Adaptation en Vertical Slice Web (ADR-003) — le GDD lui-même prescrit de commencer petit."],
    [TODAY, "AGENT 1", "Standup", "Phases 0-3 bouclées en une passe : specs UX/SPEC/TECH + ADR-003. Game core pur écrit (4 modules) puis backend cloud save. UI déléguée au sous-agent frontend."],
    [TODAY, "DEV FRONTEND", "Livraison", "T-014 : 16 composants guest/ livrés, lint 0, tsc 0, parcours navigué. BUG MOTEUR détecté (double saut de jour) et signalé — c'est la revue croisée qui paye."],
    [TODAY, "AGENT 1", "Correctif", "LL-005 : engine.ts dormir() ne pose plus que pendingSummary. Re-vérifié E2E : J1→J2 exact, résumé avec gains/dépenses exacts."],
    [TODAY, "AGENT 2 — QA", "Test", "T-016 E2E complet : création → intro Momoh → Gbaka/Jakarta/pied → jobs → events (police dash + tchatche, ambulant) → M1 offerte/acceptée/steps/done (+300F, +5 rep) → tontine débloquée → cloud save en DB (Zézé, 2029 octets) → J1→J4 → mobile 390px sans débordement → 0 erreur console."],
    [TODAY, "AGENT COMMIT", "Livraison", "T-019 : 3 commits atomiques FEAT-001 (game core/backend, UI, docs). Commit UUID ff6b21e identifié comme généré par l'automatisation du sandbox (gitkeep mini-services) — anodin."],
    [TODAY, "AGENT AUDIT GLOBAL", "Audit", "AUDIT-002 clôturé : FEAT-001 validée (conformité GDD, couches, acteurs, E2E). Rétrospective : revue croisée sous-agent→orchestrateur efficace (bug moteur attrapé) ; prochain chantier = équilibrage R-004 + audio."],
]
for i, row in enumerate(journal):
    r = 5 + i
    for c, v in enumerate(row, 2):
        ws6.cell(row=r, column=c, value=v)
    style_data_row(ws6, r, 2, LAST_COL_J, i)
ws6.freeze_panes = "C5"

wb.save(OUT)
print(f"OK — {OUT} généré ({os.path.getsize(OUT)} octets)")
