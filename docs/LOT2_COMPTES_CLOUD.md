# Lot 2 : comptes, sauvegarde cloud, hors ligne, crédit

## Principe

- Sans compte, SUGU marche comme avant (localStorage, hors ligne). Rien n'est envoyé.
- Avec un compte (Better Auth, e-mail + mot de passe), chaque écriture locale est aussi rangée dans une file
  d'attente persistante (`sugucloud_outbox`), envoyée par lots de 100 à `POST /api/sync/push`, puis les changements
  des autres appareils sont reçus par `GET /api/sync/pull?depuis=...`.
- Le serveur ne fait jamais confiance à un identifiant d'utilisateur envoyé par le client : `user_id` vient de la
  session, et chaque requête SQL est filtrée par lui (`lib/server/sync-sql.ts`).

## Données (Neon, projet `sugu`, région aws-eu-central-1)

Migrations versionnées dans `db/migrations/`, appliquées par `node scripts/migrate.mjs` (lit `DATABASE_URL` ou
`.env.local`). Tables : `boutiques`, `produits`, `clients`, `fournisseurs`, `ventes`, `vente_lignes`, `achats`,
`paiements` (remboursements de crédit), `mouvements_stock` (journal alimenté par le serveur), `sync_ops`
(opérations déjà traitées), plus les tables Better Auth. Contraintes : stock et montants >= 0, vente à crédit
obligatoirement rattachée à un client, modes de paiement énumérés.

## Synchronisation

- Idempotence : chaque opération a un `opId` ; le serveur le consigne (`sync_ops`) et ignore un rejeu.
- Conflits : **dernier écrit gagne**, sur l'horodatage client de l'opération (`client_ts`), plafonné à l'heure du
  serveur pour qu'une horloge de téléphone déréglée ne verrouille pas une entité. Une suppression est une pierre
  tombale (`deleted_at`) pour que les autres appareils la voient ; une écriture plus récente la ressuscite.
- La réception n'écrase jamais une entité qui a une modification locale en attente.
- Limite connue : le solde dû d'un client est une valeur (dernier écrit gagne). Deux appareils qui encaissent
  hors ligne en même temps sur le même client peuvent se marcher dessus ; `soldeDepuisHistorique()` recalcule le
  solde depuis les ventes à crédit et les remboursements pour contrôle.
- Déconnexion : exige que tout soit envoyé, puis vide les données du commerçant de ce téléphone (évite de mélanger
  deux comptes sur un même téléphone). Les données restent dans le cloud.

## PWA

`public/sw.js` : pages en « périmé pendant revalidation », `/_next/static` en cache d'abord, `/api/*` jamais en
cache. Après la première visite en ligne, toutes les pages principales et leurs scripts sont préchargés. À chaque
changement du service worker, incrémenter `VERSION` (sw.js) et `SW_VERSION` (components/EnregistrementSW.tsx).

## Exploitation

- Variables : voir `.env.example`. Production et prévisualisation `feat/lot2-comptes-cloud` ont `DATABASE_URL` et
  `BETTER_AUTH_SECRET`.
- Mot de passe oublié : sans `RESEND_API_KEY` + `MAIL_FROM` (domaine d'envoi vérifié chez Resend), l'e-mail n'est
  pas envoyé et la page renvoie vers docompaore2@gmail.com. Remise à zéro manuelle : supprimer la ligne `account`
  du compte et recréer le mot de passe via une inscription, ou activer Resend.
- Test d'intégration sur base réelle : `SUGU_TEST_DB=1 DATABASE_URL=... npx vitest run __tests__/integration-db.test.ts`.

## Pas fait (volontairement)

Paiement mobile réel (Orange Money, Wave) et abonnement payant : Lot 2b. Langues et voix : Lot 4.
