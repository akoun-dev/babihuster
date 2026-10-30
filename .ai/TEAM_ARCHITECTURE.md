# ARCHITECTURE DE L'ÉQUIPE VIRTUELLE — RÔLES & RACI

> Définie par le PRODUCT OWNER à l'initialisation (2026-10-30).

## 1. Organigramme

```
                    ┌─────────────────────────────┐
                    │   ORCHESTRATEUR / CTO / PO  │
                    │  (AGENT 1 + AGENT 2 fusable)│
                    └──────────────┬──────────────┘
          ┌────────────────────────┼─────────────────────────┐
          ▼                        ▼                         ▼
   PILOTAGE                 OPÉRATIONNELLE             CONTRÔLE QUALITÉ
   ├─ AGENT 1 Tech Lead     ├─ DEV BACKEND             ├─ AGENT REVIEWER
   │  & Architecte          ├─ DEV FRONTEND            ├─ AGENT AUDIT GLOBAL
   │                        ├─ DEV FULLSTACK/DATA      ├─ DEV SÉCURITÉ
   └─ AGENT 2 PM/QA         ├─ DEVOPS                  ├─ AGENT ACCESSIBILITÉ
      (QA / Product)        ├─ AGENT COMMIT            └─ AGENT PERFORMANCE
                            ├─ AGENT DOCUMENTATION
                            └─ AGENT UX/UI DESIGNER
```

## 2. RACI (tâches types)

| Tâche | AGENT 1 | AGENT 2 | DEV | REVIEWER | AUDIT | COMMIT | DOC |
|---|---|---|---|---|---|---|---|
| Analyse projet | **A/R** | C | C | I | C | — | — |
| Spec feature (Phase 1) | C | **A/R** | C | I | I | — | I |
| Design technique (Phase 2) | **A/R** | C | C | I | I | — | I |
| Implémentation | A | I | **R** | C | I | C | I |
| Revue de code | A | I | I | **R** | I | — | — |
| Tests E2E | C | **A/R** | C | I | I | — | — |
| Commit | I | I | C | I | I | **R** (A=AGENT 1) | — |
| Documentation | C | I | I | I | I | — | **R** (A=AGENT 1) |
| Audit global | C | I | I | I | **A/R** | — | C |
| Clôture tâche | **A** | **R** (double validation) | I | C | C | I | I |

*Légende : R= Réalise, A= Approuve (ne peut pas être la même entité que R pour la clôture), C= Consulté, I= Informé.*

## 3. Règles de collaboration

1. **Double validation de clôture** : une tâche n'est `Terminé` que si le réalisateur (R) a produit ses preuves ET l'approbateur (A) a vérifié. AGENT 1 ne peut pas déclarer seul une tâche terminée.
2. **Handoff** : tout transfert de travail entre agents est tracé dans `.ai/HANDOFFS/` (format libre : agent sortant, entrant, contexte, points d'attention).
3. **API-first** : le frontend est développé d'abord sur la base du **contrat** (types + schéma zod partagés), l'implémentation API suit — jamais l'inverse.
4. **Non-duplication cross-team** : avant tout nouveau composant/hook/service, vérifier `shared/` puis le dossier de l'acteur ; toute duplication exige une justification dans ARCHITECTURE.md.
5. **Protection anti-régression** : toute modification d'un fichier existant exige de relire ses consommateurs (grep des imports) avant livraison.

## 4. Modalités d'exécution (mapping outil)

| Agent | Modalité |
|---|---|
| AGENT 1 / AGENT 2 / COMMIT / DOC / DEVOPS | Orchestrateur (direct) |
| DEV FRONTEND / UX/UI DESIGNER | sous-agent `frontend-styling-expert` |
| DEV BACKEND / FULLSTACK/DATA | sous-agent `full-stack-developer` |
| REVIEWER / SÉCURITÉ / AUDIT GLOBAL | sous-agent `Explore` / `general-purpose` (lecture seule + rapport) |
| QA E2E | navigateur agent (agent-browser) |
