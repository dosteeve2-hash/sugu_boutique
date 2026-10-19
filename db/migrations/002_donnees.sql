-- SUGU Lot 2 : données commerçant, isolées par utilisateur (user_id = "user".id de Better Auth).
-- Toutes les lectures/écritures passent par le serveur, filtrées par l'identité de session.
-- Les identifiants d'entités sont ceux générés par l'application (hors ligne) : l'écriture est un upsert.
-- Résolution de conflit : dernier écrit gagne, sur l'horodatage client (client_ts). Les suppressions sont des
-- pierres tombales (deleted_at) pour que les autres appareils les voient.

create table if not exists sync_ops (
  op_id      text primary key,
  user_id    text not null references "user" ("id") on delete cascade,
  applied_at timestamptz not null default now()
);
create index if not exists sync_ops_user_idx on sync_ops (user_id, applied_at);

create table if not exists boutiques (
  id            text primary key,
  user_id       text not null references "user" ("id") on delete cascade,
  nom           text not null check (char_length(nom) between 1 and 80),
  type          text not null check (type in ('Alimentation','Vêtements','Électronique','Restaurant','Autre')),
  emoji         text not null default '🏪',
  couleur       text not null default '#D4AF37',
  date_creation text not null,
  client_ts     timestamptz not null,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists boutiques_user_idx on boutiques (user_id, updated_at);

create table if not exists produits (
  boutique_id text   not null references boutiques (id) on delete cascade,
  id          bigint not null,
  user_id     text   not null references "user" ("id") on delete cascade,
  nom         text   not null check (char_length(nom) between 1 and 120),
  categorie   text   not null default '',
  prix_achat  bigint not null default 0 check (prix_achat >= 0),
  prix_vente  bigint not null default 0 check (prix_vente >= 0),
  stock       bigint not null default 0 check (stock >= 0),
  stock_min   bigint not null default 0 check (stock_min >= 0),
  unite       text,
  client_ts   timestamptz not null,
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  primary key (boutique_id, id)
);
create index if not exists produits_user_idx on produits (user_id, boutique_id, updated_at);

create table if not exists clients (
  boutique_id     text   not null references boutiques (id) on delete cascade,
  id              bigint not null,
  user_id         text   not null references "user" ("id") on delete cascade,
  nom             text   not null check (char_length(nom) between 1 and 120),
  telephone       text   not null default '',
  ville           text   not null default '',
  solde_du        bigint not null default 0 check (solde_du >= 0),
  total_achats    bigint not null default 0 check (total_achats >= 0),
  derniere_visite text   not null default '',
  client_ts       timestamptz not null,
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  primary key (boutique_id, id)
);
create index if not exists clients_user_idx on clients (user_id, boutique_id, updated_at);

create table if not exists fournisseurs (
  boutique_id       text   not null references boutiques (id) on delete cascade,
  id                bigint not null,
  user_id           text   not null references "user" ("id") on delete cascade,
  nom               text   not null check (char_length(nom) between 1 and 120),
  contact           text   not null default '',
  ville             text   not null default '',
  produits          text   not null default '',
  total_achats      bigint not null default 0 check (total_achats >= 0),
  derniere_commande text   not null default '',
  client_ts         timestamptz not null,
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  primary key (boutique_id, id)
);
create index if not exists fournisseurs_user_idx on fournisseurs (user_id, boutique_id, updated_at);

create table if not exists ventes (
  boutique_id   text   not null references boutiques (id) on delete cascade,
  id            bigint not null,
  user_id       text   not null references "user" ("id") on delete cascade,
  client_id     bigint,
  client        text   not null default '',
  total         bigint not null check (total >= 0),
  mode_paiement text   not null check (mode_paiement in ('Espèces','Orange Money','Wave','Moov Money','Crédit')),
  statut        text   not null check (statut in ('Payé','Crédit')),
  date          text   not null,
  satisfaction  text   check (satisfaction in ('bien','correct','probleme')),
  client_ts     timestamptz not null,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  primary key (boutique_id, id),
  check (statut <> 'Crédit' or client_id is not null)
);
create index if not exists ventes_user_idx on ventes (user_id, boutique_id, updated_at);

create table if not exists vente_lignes (
  boutique_id text   not null,
  vente_id    bigint not null,
  position    int    not null,
  user_id     text   not null references "user" ("id") on delete cascade,
  produit_id  bigint not null,
  nom         text   not null,
  quantite    bigint not null check (quantite > 0),
  prix_unit   bigint not null check (prix_unit >= 0),
  prix_achat  bigint check (prix_achat is null or prix_achat >= 0),
  primary key (boutique_id, vente_id, position),
  foreign key (boutique_id, vente_id) references ventes (boutique_id, id) on delete cascade
);

create table if not exists achats (
  boutique_id    text   not null references boutiques (id) on delete cascade,
  id             bigint not null,
  user_id        text   not null references "user" ("id") on delete cascade,
  fournisseur_id bigint,
  fournisseur    text   not null default '',
  produit_id     bigint,
  produit        text   not null default '',
  quantite       bigint not null check (quantite >= 0),
  prix_unit      bigint not null check (prix_unit >= 0),
  total          bigint not null check (total >= 0),
  statut         text   not null check (statut in ('Livré','En attente')),
  date           text   not null,
  client_ts      timestamptz not null,
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  primary key (boutique_id, id)
);
create index if not exists achats_user_idx on achats (user_id, boutique_id, updated_at);

-- Encaissements de remboursements de crédit
create table if not exists paiements (
  boutique_id text   not null references boutiques (id) on delete cascade,
  id          bigint not null,
  user_id     text   not null references "user" ("id") on delete cascade,
  client_id   bigint not null,
  montant     bigint not null check (montant > 0),
  mode        text   not null check (mode in ('Espèces','Orange Money','Wave','Moov Money')),
  date        text   not null,
  client_ts   timestamptz not null,
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  primary key (boutique_id, id)
);
create index if not exists paiements_user_idx on paiements (user_id, boutique_id, updated_at);

-- Journal des mouvements de stock, alimenté par le serveur à partir des ventes et des achats livrés
create table if not exists mouvements_stock (
  boutique_id text   not null references boutiques (id) on delete cascade,
  user_id     text   not null references "user" ("id") on delete cascade,
  motif       text   not null check (motif in ('vente','achat')),
  source_id   bigint not null,
  produit_id  bigint not null,
  delta       bigint not null,
  date        text   not null,
  created_at  timestamptz not null default now(),
  primary key (boutique_id, motif, source_id, produit_id)
);
create index if not exists mouvements_user_idx on mouvements_stock (user_id, boutique_id, created_at);
