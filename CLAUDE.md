# DUKA — Logiciel de Gestion de Boutique

**FORGE Afrika** — Solution de gestion pour commerçants africains

---

## Palette OBLIGATOIRE

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#0A1628` | Fond principal |
| Navy2 | `#070e1f` | Sidebar, headers |
| Navy3 | `#0c1528` | Cartes |
| Gold | `#D4AF37` | Accent principal, KPIs |
| Cyan | `#00BCD4` | Accent secondaire |
| Cream | `#F8F9FA` | Texte principal |
| Gray | `#9ba8c4` | Texte secondaire |
| Muted | `#4e5f82` | Labels, placeholders |
| Border | `#16233d` | Bordures légères |
| Green | `#22d98a` | Succès, stock OK |
| Red | `#ef4444` | Erreur, stock faible |
| Orange | `#f0a832` | Avertissement |

---

## Stack

```
Next.js 15 (App Router) + TypeScript strict
Tailwind CSS v4 + postcss
Supabase (PostgreSQL + Auth + RLS)
Recharts — graphiques
Lucide React — icônes
Framer Motion — animations (si besoin)
```

---

## Architecture

```
duka/
├── app/
│   ├── layout.tsx          — Layout avec Sidebar
│   ├── page.tsx            — Tableau de bord
│   ├── produits/page.tsx
│   ├── ventes/page.tsx
│   ├── achats/page.tsx
│   ├── clients/page.tsx
│   ├── fournisseurs/page.tsx
│   ├── stock/page.tsx
│   └── rapports/page.tsx
├── components/
│   └── Sidebar.tsx
├── lib/
│   └── supabase/
│       ├── client.ts       — Browser client
│       └── server.ts       — Server client
└── supabase/
    └── migrations/
        └── 001_init.sql    — Schéma complet + RLS
```

---

## Règles de Sécurité OBLIGATOIRES

1. **Toujours `getUser()`** — jamais `getSession()` pour vérifier l'auth côté serveur
2. **RLS sur toutes les tables** — chaque commerçant ne voit que sa boutique
3. **`.env.local` jamais commité** — vérifier `.gitignore`
4. **BOM strip** sur les variables Supabase : `.replace(/^﻿/, '')`
5. **`npm run build`** avant tout push — zéro erreur TypeScript acceptable

---

## Modèle de Données

### Flux principal
```
Boutique → Fournisseur → Achat → Achat_Lignes → [Trigger: +Stock]
Boutique → Client → Vente → Vente_Lignes → [Trigger: -Stock]
```

### Tables
- `boutiques` — 1 par commerçant (lié à auth.users)
- `categories` — catégories de produits
- `produits` — catalogue avec stock
- `fournisseurs` — partenaires d'approvisionnement
- `clients` — avec suivi du solde dû (crédit)
- `achats` + `achat_lignes` — commandes fournisseur
- `ventes` + `vente_lignes` — transactions client

---

## Prochaines Features

- [ ] Auth Supabase (inscription commerçant)
- [ ] Caisse (POS simplifié) — écran de vente rapide
- [ ] Impression reçus (PDF)
- [ ] Export Excel des rapports
- [ ] Multi-boutique (pour chaînes)
- [ ] Mode offline (PWA)
- [ ] App mobile (React Native / Expo)

---

*Dernière mise à jour : 2026-07-25*
*Projet FORGE Afrika — Steve Donald Compaoré*
