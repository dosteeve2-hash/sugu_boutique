# SUGU — Lovable Protocol

## Vision
SUGU (« marché » en langues africaines) est le logiciel de gestion pour le secteur informel africain. Il remplace le cahier de comptes papier des boutiquiers, vendeurs de rue et commerçants de marché — avec une interface si simple qu'elle s'utilise sans formation, en 4 langues, offline à 100%.

## Utilisateurs cibles
- **Persona 1 — Aminata, Vendeuse de pagnes (marché de Gounghin, Ouagadougou)** : Pas de formation, smartphone Android basique. Besoin : saisir une vente en 10 secondes, voir ce qu'elle doit encaisser, voir son stock restant.
- **Persona 2 — Moussa, Boutiquier de quartier (Koudougou)** : Vend à crédit à ses voisins. Besoin : suivre les dettes clients, savoir ce qu'il doit à ses fournisseurs, voir son bénéfice du mois.
- **Persona 3 — Fatou, Revendeuse de légumes (marché de Pissy)** : Utilise Wave pour être payée. Besoin : distinguer les paiements cash/Mobile Money, impression/partage du récapitulatif journalier.

## Fonctionnalités core
### P0 (MVP live)
- Tableau de bord KPIs dynamiques (ventes du jour, stock faible, créances clients)
- CRUD Produits (nom, prix, stock, catégorie)
- CRUD Ventes (lignes produits, mode paiement : Espèces / Orange Money / Wave / Moov / Crédit)
- CRUD Achats (fournisseur, produits, incrément stock automatique)
- CRUD Clients (solde dû, historique)
- CRUD Fournisseurs (historique achats)
- Vue Stock (dérivée des produits, alertes seuil)
- Rapports (agrégation dynamique ventes/achats, graphiques Recharts)
- Multi-langue : Français, Anglais, Jula, Mooré
- Offline-first 100% (localStorage — zéro perte données hors connexion)
- Sidebar avec sélecteur langue + indicateur statut offline

### P1 (prochaine itération)
- Sync Supabase (sauvegarde cloud quand connexion disponible)
- Auth Supabase (chaque commerçant ne voit que sa boutique — RLS)
- Export PDF récapitulatif journalier/hebdomadaire
- Impression ticket de caisse (format 58mm imprimante thermique)
- Mode multi-utilisateurs (propriétaire + vendeur)

### P2 (roadmap)
- Application Android native (APK via Capacitor/Expo)
- Scan codes-barres (caméra smartphone)
- Intégration ValueChain Connect (approvisionnement direct fournisseurs)
- Tableau de bord fédération (chaîne de boutiques)
- Rapports fiscaux simplifiés (TNR Burkina Faso)

## Design System
- **Couleurs** : Navy `#0A1628` (fond), Navy2 `#070e1f` (sidebar), Gold `#D4AF37` (KPIs, accents), Cyan `#00BCD4` (secondaire), Green `#22d98a` (succès stock), Red `#ef4444` (alerte), Orange `#f0a832` (avertissement)
- **Typographie** : Inter (corps), Geist (chiffres/données)
- **Animations** : Framer Motion (transitions pages), aucune animation superflue (perf mobile)
- **Icônes** : Lucide React
- **Charts** : Recharts

## Stack Technique
- **Frontend** : Next.js 15 (App Router), React 19, TypeScript strict
- **Styles** : Tailwind CSS v4
- **Persistance** : localStorage (offline-first) — Supabase sync future
- **Backend (futur)** : Supabase (PostgreSQL, Auth, RLS)
- **Charts** : Recharts
- **Animations** : Framer Motion v11
- **Déploiement** : Vercel

## Modèle de données (localStorage)

### `produits[]`
| Champ | Type | Description |
|-------|------|-------------|
| id | string | UUID local |
| nom | string | Nom produit |
| prix | number | Prix vente FCFA |
| prixAchat | number | Coût d'achat FCFA |
| stock | number | Quantité en stock |
| categorie | string | Catégorie |
| seuilAlerte | number | Seuil alerte stock faible |

### `ventes[]`
| Champ | Type | Description |
|-------|------|-------------|
| id | string | UUID local |
| date | string | ISO datetime |
| lignes | array | [{produitId, qte, prix}] |
| total | number | Total FCFA |
| modePaiement | enum | especes/orange/wave/moov/credit |
| clientId | string | FK clients (optionnel) |

### `clients[]`
| Champ | Type | Description |
|-------|------|-------------|
| id | string | UUID local |
| nom | string | Nom client |
| telephone | string | Numéro téléphone |
| solde | number | Montant dû (crédit) |

## Flux utilisateur clé — Vente à crédit sur mobile

1. Aminata ouvre SUGU sur son téléphone (offline, marché Gounghin)
2. Clique "Nouvelle vente" → recherche "pagne wax 6 yards" → sélectionne
3. Quantité: 2 → total : 12 000 FCFA
4. Mode paiement : "Crédit" → sélectionne client Konaté Mariam
5. Confirme → vente enregistrée localStorage → stock -2
6. Konaté Mariam apparaît dans `/clients` avec solde dû 12 000 FCFA
7. Semaine suivante : Konaté paye → solde mis à zéro dans clients

## Critères de succès
- Saisie vente complète en < 15 secondes (mobile, doigts)
- Zéro perte de données hors connexion (localStorage persistant)
- Interface utilisable par quelqu'un qui n'a jamais utilisé d'app de gestion
- Changement de langue en 1 clic (FR / EN / Jula / Mooré)
- Charge en < 1 seconde sur connexion 3G faible
- Score Lighthouse Performance > 90 (mobile)
- Zéro erreur `npm run build` (TypeScript strict)

---
*Lovable Protocol v1.0 — FORGE Afrika © 2025 — Steeve Donald Compaore*
