# SUGU

**FORGE Afrika** — Logiciel de gestion pour le secteur informel africain. "Sugu" signifie *marché* en langues africaines.

Outil pensé pour les vendeurs de rue, les boutiquiers de quartier et les commerçants informels — assez simple pour être utilisé sans formation. Remplace le cahier de comptes papier.

**[📄 PRD](./PRD.md)** · **[🧭 CLAUDE.md](./CLAUDE.md)**

## Fonctionnalités

- Tableau de bord avec KPIs dynamiques
- Produits, ventes, achats, clients, fournisseurs, stock, rapports
- Données enregistrées sur le téléphone (localStorage), export/import JSON dans Paramètres ; pas de synchronisation ni de compte pour l'instant
- Multi-langue : Français, Anglais, Jula, Mooré
- Modes de paiement : Espèces, Orange Money, Wave, Moov Money, Crédit
- Mobile-first

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · Supabase (sync distante à venir) · Recharts · Framer Motion

## Développement

```bash
npm install
npm run dev
```

---

*Projet FORGE Afrika — Steve Donald Compaoré*
