<p align="center"><img src="public/brand/mark.svg" alt="SUGU" width="72" height="72"></p>

<h1 align="center">SUGU</h1>

**FORGE Afrika** — Logiciel de gestion pour le secteur informel africain. "Sugu" signifie *marché* en langues africaines.

**Statut : en développement (pilote).** Outil pensé pour les vendeurs de rue, les boutiquiers de quartier et les commerçants informels — assez simple pour être utilisé sans formation. Remplace le cahier de comptes papier.

**[📄 PRD](./PRD.md)** · **[🧭 CLAUDE.md](./CLAUDE.md)**

## Fonctionnalités

- Tableau de bord avec KPIs dynamiques
- Produits, ventes, achats, clients, fournisseurs, stock, rapports
- Données enregistrées sur le téléphone (localStorage), export/import JSON dans Paramètres ; compte gratuit optionnel (Neon + Better Auth) pour sauvegarder en ligne, démarrage hors ligne (PWA), crédit à la caisse et remboursements. Voir docs/LOT2_COMPTES_CLOUD.md
- Multi-langue : Français, Anglais, Jula, Mooré
- Modes de règlement enregistrés à la caisse : Espèces, Orange Money, Wave, Moov Money, Crédit. Ce sont des libellés pour tenir le cahier : aucune intégration aux services de paiement mobile n'existe, aucun paiement n'est traité par l'application
- Mobile-first

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · Neon + Better Auth (sauvegarde cloud) · Recharts · Framer Motion

## Développement

```bash
npm install
npm run dev
```

Sans configuration, l'application fonctionne en local (localStorage). Pour la sauvegarde cloud, définir `DATABASE_URL` (voir `.env.example`) puis appliquer les migrations avec `node scripts/migrate.mjs`.

---

*Projet FORGE Afrika — Steve Donald Compaoré*
