# CI sur GitHub (SUGU, dépôt pilote)

Objectif : faire tourner builds, tests et audits sur GitHub, pas sur le PC de Steeve. Règle #0 : zéro dépense.

## Règle d'or

**Ne jamais activer un plafond de dépense supérieur à 0 $** (GitHub, Settings, Billing, Budgets and alerts). Avec le plafond à 0 $, GitHub bloque au lieu de facturer quand l'offre gratuite est épuisée. Seul `ubuntu-latest` est utilisé (jamais Windows, macOS ni runners plus gros : ils consomment les minutes ×2 à ×10).

## Workflows

| Fichier | Déclencheur | Ce qu'il fait | Minutes (environ) |
|---|---|---|---|
| `.github/workflows/ci.yml`, job `verifier` | pull request, push sur `master`, lancement manuel | `npm ci`, `tsc --noEmit`, lint (non bloquant), 150 tests vitest, `next build` (avec `DATABASE_URL` et secret factices) | 4 à 7 min |
| `ci.yml`, job `audit` | lancement manuel, chaque lundi 06:00 UTC | `npm audit --omit=dev --audit-level=high` (non bloquant) | 1 à 2 min |
| `.github/workflows/lighthouse.yml` | manuel uniquement | build, `next start`, Lighthouse mobile sur accueil, tarifs, fonctionnalités ; rapports en artefact (7 jours) | 6 à 9 min |

Les anciens lancements d'une même branche sont annulés automatiquement (`concurrency`). Chaque job a un `timeout-minutes`. Budget indicatif : 20 PR/mois × 2 lancements ≈ 250 min, loin des 3 000 min/mois du Student Pack.

## Lancer Lighthouse à la main

GitHub, onglet **Actions**, workflow **Lighthouse (manuel)**, bouton **Run workflow**. À la fin, ouvrir l'exécution, section **Artifacts**, télécharger `rapports-lighthouse` (fichiers `.report.html`). Les scores s'affichent aussi dans le log de l'étape de mesure.

## Ouvrir un Codespace (environnement de dev dans le navigateur)

Dépôt sur GitHub, bouton **Code**, onglet **Codespaces**, **Create codespace on master**. Le fichier `.devcontainer/devcontainer.json` installe Node 22 et lance `npm ci`. Machine demandée : 2 cœurs, 8 Go (= 2 heures-cœur consommées par heure d'usage : 180 h du Student Pack ≈ 90 h réelles). Aucune clé n'est incluse : créer `.env.local` à la main dans le Codespace si besoin.

## Arrêter un Codespace pour ne pas consommer d'heures

- Menu **Codespaces** (github.com/codespaces), `...` à côté du codespace, **Stop codespace**.
- Ou dans le terminal du codespace : `gh codespace stop`.
- Il s'arrête seul après 30 min d'inactivité par défaut ; réduire ce délai dans github.com/settings/codespaces (Default idle timeout).
- Supprimer les codespaces inutiles (le stockage compte aussi).

## Hors GitHub

Le workflow n'exige aucun secret. Pour que `master` reste vert, activer la protection de branche (check `verifier` obligatoire) : réglage de dépôt, à faire par Steeve.
