# PRD — SUGU

## Résumé exécutif
SUGU (« marché » en langues africaines) est un logiciel de gestion de boutique conçu pour le secteur informel africain : vendeurs de rue, boutiquiers de quartier, petits commerçants. Il remplace le cahier de comptes papier par une application web mobile-first, offline-first, disponible en français, anglais, jula et mooré.

## Motivation originale
> "Outil de gestion pour le secteur informel africain. La vieille qui vend au bord de la route le soir, le boutiquier de quartier qui utilise un cahier. Simple comme bonjour — tellement simple que même quelqu'un pas à l'aise avec le numérique peut utiliser ça. Multi-langue : FR, EN, Jula, Mooré. Offline-first. Paiements africains : Orange Money, Wave. Remplace le cahier de comptes."
> — Steeve Donald Compaoré

Cette vision est fidèlement reprise dans `CLAUDE.md` : "Outil de gestion pensé pour les vendeurs de rue, boutiquiers de quartier et commerçants informels — assez simple pour être utilisé sans formation."

## Vision et ambition
SUGU est la filiale **Retail** de l'écosystème FORGE Afrika (référencée dans `forge-afrika/lib/constants.ts` sous le slug `sugu`, catégorie Retail, couleur `#F97316`). Elle incarne la stratégie "pioche" de FORGE Afrika appliquée au commerce informel : donner aux dizaines de millions de petits commerçants africains — la majorité de l'activité économique réelle du continent — un outil numérique aussi simple qu'un cahier, mais qui produit de la donnée exploitable (stock, ventes, crédits clients). À terme, cette donnée peut ouvrir l'accès au crédit et à la formalisation progressive, sans jamais forcer une complexité que l'utilisateur ne demande pas.

## Problème résolu
- Le commerçant informel gère son stock, ses ventes et ses créances clients ("soldeDu") de tête ou sur papier, avec un risque d'erreur, de perte et d'absence totale de visibilité sur sa rentabilité.
- La connectivité est instable dans les zones où ces commerçants opèrent — un outil qui dépend d'internet pour chaque action est inutilisable.
- Les outils de gestion existants (Excel, ERP classiques) sont trop complexes, trop chers, et pas dans les langues locales.

## Utilisateurs cibles
- Vendeuses et vendeurs de rue.
- Boutiquiers de quartier (épiceries, boutiques générales).
- Petits commerçants du secteur informel, non formés au numérique — le critère de conception numéro un est l'utilisabilité sans formation.

## Fonctionnalités clés (MVP)
Construites (code présent) :
- **Tableau de bord** (`app/page.tsx`) — KPIs dynamiques calculés depuis les données locales.
- **Produits** (`app/produits/page.tsx`) — CRUD catalogue avec `prixAchat`, `prixVente`, `stock`, `stockMin`.
- **Ventes** (`app/ventes/page.tsx`) — CRUD ventes multi-lignes, 5 modes de paiement (Espèces, Orange Money, Wave, Moov Money, Crédit), décrémente le stock, met à jour le solde dû du client si vente à crédit.
- **Achats** (`app/achats/page.tsx`) — CRUD achats fournisseurs, incrémente le stock quand le statut passe à "Livré".
- **Clients** (`app/clients/page.tsx`) — CRUD avec suivi du solde dû (crédit) et total achats.
- **Fournisseurs** (`app/fournisseurs/page.tsx`) — CRUD partenaires d'approvisionnement.
- **Stock** (`app/stock/page.tsx`) — vue dérivée des produits (source unique de vérité).
- **Rapports** (`app/rapports/page.tsx`) — agrégation dynamique ventes/achats.
- **i18n** (`components/LangueProvider.tsx`, `lib/i18n.ts`) — FR (défaut), EN, Jula, Mooré, sélecteur dans la Sidebar.
- **Offline-first** (`lib/storage.ts`) — persistance immédiate en `localStorage`, statut en ligne/hors ligne affiché en temps réel dans la Sidebar.
- **Mobile-first** — Sidebar en tiroir sous 768px, grilles KPI adaptatives, tables à scroll horizontal.
- **Schéma Supabase de référence** (`supabase/migrations/001_init.sql`) — tables `boutiques`, `categories`, `produits`, `fournisseurs`, `clients`, `achats`/`achat_lignes`, `ventes`/`vente_lignes`, prêtes pour la sync distante future.

Prévues (documentées dans CLAUDE.md, non construites) :
- Authentification Supabase (inscription commerçant) + synchronisation localStorage ↔ Supabase.
- Intégration réelle des paiements Orange Money / Wave (l'UI existe déjà, pas l'API).
- Caisse (POS simplifié) — écran de vente rapide.
- Impression de reçus (PDF).
- Export Excel des rapports.
- Multi-boutique (pour les chaînes).
- PWA installable (Service Worker, icônes).
- App mobile (React Native / Expo).

## Stack technique
```
Frontend     Next.js 15.5.21 (App Router) + React 19 + TypeScript strict
Styling      Tailwind CSS v4
Persistance  localStorage (offline-first) — Supabase prévu pour la sync distante
Auth/DB      @supabase/ssr + @supabase/supabase-js (clients prêts, intégration à venir)
Charts       Recharts
Icônes       Lucide React
Animations   Framer Motion
Déploiement  Vercel (sugu.vercel.app)
```

## Intégration écosystème FORGE Afrika
SUGU est listée comme filiale "Actif" de FORGE Afrika HQ (`forge-afrika/lib/constants.ts`), avec des métriques consolidées (utilisateurs, transactions, CA) remontées au dashboard groupe. Dans le flux de données FORGE (collecte terrain → production/ERP → comptabilité → marketplace B2B), SUGU se positionne côté vente au détail/informel — un point d'entrée massif en volume d'utilisateurs, complémentaire de CompTrack (comptabilité PME formelles) et TAAMA (traçabilité industrielle).

## Feuille de route
### Phase 1 — MVP (actuel)
Gestion complète en localStorage : produits, ventes, achats, clients, fournisseurs, stock, rapports, i18n, mobile-first. Zéro donnée fictive — chaque page démarre vide avec un `EmptyState` qui guide l'utilisateur.

### Phase 2 — Croissance
Auth Supabase + sync cloud (le schéma SQL est déjà prêt), intégration réelle Orange Money/Wave, POS simplifié, PWA installable.

### Phase 3 — Scale
App mobile native (React Native/Expo), multi-boutique pour les chaînes, export Excel, impression de reçus PDF — ouvrant la voie à des services à valeur ajoutée (accès au crédit basé sur l'historique de ventes).

## Métriques de succès
- Métriques consolidées déjà trackées côté FORGE Afrika HQ : utilisateurs actifs, transactions, chiffre d'affaires transitant par la plateforme.
- Adoption sans formation : taux d'utilisateurs actifs après la première session sans support.
- Fiabilité offline : zéro perte de donnée en cas de coupure réseau (garantie par l'écriture immédiate en localStorage).
- Taux de conversion Crédit → Payé (santé du recouvrement client via `soldeDu`).

## Contraintes et décisions clés
- **Offline-first non négociable** — toute écriture passe d'abord par `localStorage` via `usePersisted`, jamais de dépendance à la connexion pour une action utilisateur.
- **Zéro donnée fictive** — règle UX explicite : pas de mock data, chaque page démarre vide.
- **Sécurité Supabase anticipée dès le schéma** — RLS sur toutes les tables (chaque commerçant ne voit que sa boutique), `getUser()` jamais `getSession()`, BOM strip sur les variables d'environnement Supabase.
- **`npm run build` zéro erreur TypeScript avant tout push.**
- **Stock = source unique de vérité** — la page `/stock` est dérivée de `/produits`, pas une entité séparée, pour éviter toute désynchronisation.

---
*PRD rédigé par Claude (COO) sur instruction de Steve Donald Compaore (PDG FORGE Afrika)*
*Dernière mise à jour : 2026-07-25*
