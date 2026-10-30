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
    ["T-010", "Produit", "Cahier des charges / premier backlog produit (attente utilisateur)", "PRODUCT OWNER", "P0", "Bloqué", 0.0, "", "", "SPECS/FEATURE-001", "", "Dépendance externe : utilisateur"],
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
    ["FEAT-000", "En attente de cahier des charges", "—", "", "", "", "", "PRODUCT OWNER", "Bloqué", "Aucune feature métier demandée — le système est prêt à encaisser"],
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
    ["D-001", "Dette data", "Schéma Prisma scaffold (User/Post) sans rôles ni permissions", "Élevé", "—",
     "Redéfinir le schéma à la première feature (matrice acteurs de .ai/ACTORS.md)", "DEV FULLSTACK/DATA", "Ouvert"],
    ["D-002", "Dette qualité", "Version 'v0.2.1' en dur dans Header/Footer ; aucune source unique", "Faible", "—",
     "Centraliser la version dans une constante partagée lors de la première évolution", "DEV FRONTEND", "Ouvert"],
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
    [TODAY, "AGENT 1", "Standup", "Initialisation du système. Analyse complète terminée : scaffold Next.js 16 vierge, aucune feature, aucun acteur métier."],
    [TODAY, "AGENT AUDIT GLOBAL", "Audit", "AUDIT-001 clôturé : gouvernance .ai/ créée, dette tracée (5 entrées), normalisation P0 lancée."],
    [TODAY, "DEV FRONTEND", "Livraison", "T-004 livré : layout min-h-screen flex flex-col + footer sticky mt-auto, séparation shared/guest amorcée, lint clean."],
    [TODAY, "AGENT REVIEWER", "Revue", "T-007 : verdict APPROUVÉ AVEC RÉSERVES. MAJ-01 (reduced-motion du SVG), MIN-01 (labels mobile), 3 suggestions appliquées ; débordement 320px corrigé (masquage texte marque < 400px). Re-vérifié : 0 débordement à 320/390/768px."],
    [TODAY, "AGENT 2 — QA", "Test", "T-008 E2E : rendu desktop/mobile OK, ancres #stack/#statut fonctionnelles, footer sticky prouvé (844/844 sur page courte, poussé naturellement sur page longue), API /api OK, 0 erreur console, skip-link conforme (sr-only)."],
    [TODAY, "PRODUCT OWNER", "Décision", "Système opérationnel et en attente du cahier des charges. AUCUNE feature ne sera inventée sans spécification utilisateur."],
]
for i, row in enumerate(journal):
    r = 5 + i
    for c, v in enumerate(row, 2):
        ws6.cell(row=r, column=c, value=v)
    style_data_row(ws6, r, 2, LAST_COL_J, i)
ws6.freeze_panes = "C5"

wb.save(OUT)
print(f"OK — {OUT} généré ({os.path.getsize(OUT)} octets)")
