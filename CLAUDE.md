# SUGU — Logiciel de Gestion pour le Secteur Informel

**FORGE Afrika** — "Sugu" = marché, en langues africaines. Outil de gestion pensé pour les vendeurs de rue, boutiquiers de quartier et commerçants informels — assez simple pour être utilisé sans formation.

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
Persistance : localStorage (offline-first) — Supabase prévu en sync distante future
Recharts — graphiques
Lucide React — icônes
Framer Motion — animations (si besoin)
```

---

## Architecture

```
sugu/ (dossier local : duka/)
├── app/
│   ├── layout.tsx          — Layout avec Sidebar + LangueProvider
│   ├── page.tsx            — Tableau de bord (KPIs dynamiques)
│   ├── produits/page.tsx   — CRUD produits
│   ├── ventes/page.tsx     — CRUD ventes + lignes + mode de paiement
│   ├── achats/page.tsx     — CRUD achats + incrément stock
│   ├── clients/page.tsx    — CRUD clients + solde dû
│   ├── fournisseurs/page.tsx
│   ├── stock/page.tsx      — dérivé de produits (source unique)
│   └── rapports/page.tsx   — agrégation dynamique ventes/achats
├── components/
│   ├── Sidebar.tsx         — nav i18n + sélecteur langue + statut offline
│   ├── LangueProvider.tsx  — contexte i18n (FR/EN/Jula/Mooré)
│   ├── EmptyState.tsx      — état vide réutilisable
│   ├── Modal.tsx           — modal réutilisable pour formulaires
│   └── FormField.tsx       — champs de formulaire standardisés
├── lib/
│   ├── types.ts            — types partagés (Produit, Client, Vente...)
│   ├── storage.ts          — hook usePersisted (localStorage)
│   ├── i18n.ts             — dictionnaire de traductions
│   └── supabase/
│       ├── client.ts       — Browser client (sync future)
│       └── server.ts       — Server client (sync future)
└── supabase/
    └── migrations/
        └── 001_init.sql    — Schéma complet + RLS (référence pour sync future)
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

### Flux principal (actuellement en localStorage, clé par entité)
```
Fournisseur → Achat → [+Stock produit, +totalAchats fournisseur]
Client → Vente (lignes multi-produits) → [-Stock produit, +totalAchats/soldeDu client]
```

### Clés localStorage
- `sugu_produits` — catalogue avec stock (source unique, aussi utilisée par /stock)
- `sugu_clients` — avec suivi du solde dû (crédit)
- `sugu_fournisseurs` — partenaires d'approvisionnement
- `sugu_achats` — commandes fournisseur (incrémente le stock si "Livré")
- `sugu_ventes` — transactions client (décrémente le stock, met à jour le solde dû si "Crédit")
- `sugu_langue` — langue choisie (fr/en/jula/more)

### Tables Supabase (schéma de référence, pour sync future)
- `boutiques`, `categories`, `produits`, `fournisseurs`, `clients`, `achats` + `achat_lignes`, `ventes` + `vente_lignes`

---

## Règles UX spécifiques à SUGU

1. **Zéro donnée fictive** — chaque page démarre vide ; un `EmptyState` guide l'utilisateur vers sa première action.
2. **Offline-first** — toute donnée est écrite en localStorage immédiatement (`lib/storage.ts`), jamais de perte si la connexion tombe. La Sidebar affiche le statut en ligne/hors ligne en temps réel.
3. **i18n basique** — FR (défaut), EN, Jula, Mooré via `lib/i18n.ts` + `LangueProvider`. Le sélecteur est dans la Sidebar.
4. **Paiement mobile** — Espèces, Orange Money, Wave, Moov Money, Crédit sont proposés comme modes de paiement dans le formulaire de vente (UI prête, intégration API à venir).
5. **Mobile-first** — Sidebar en tiroir (hamburger) sous 768px, grilles KPI qui repassent en 1-2 colonnes, tables avec scroll horizontal. Toujours tester à 375px.

---

## Prochaines Features

- [ ] Auth Supabase (inscription commerçant) + sync localStorage ↔ Supabase
- [ ] Intégration réelle Orange Money / Wave (actuellement UI seulement)
- [ ] Caisse (POS simplifié) — écran de vente rapide
- [ ] Impression reçus (PDF)
- [ ] Export Excel des rapports
- [ ] Multi-boutique (pour chaînes)
- [ ] PWA installable (Service Worker, icônes)
- [ ] App mobile (React Native / Expo)

---

*Dernière mise à jour : 2026-07-25*
*Projet FORGE Afrika — Steve Donald Compaoré*
