-- ============================================================
-- SUGU — Schéma initial
-- FORGE Afrika — Logiciel de gestion pour le secteur informel
-- ============================================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE : boutiques
-- ============================================================
create table if not exists boutiques (
  id          uuid primary key default uuid_generate_v4(),
  nom         text not null,
  proprietaire_id uuid references auth.users(id) on delete cascade,
  ville       text,
  pays        text default 'Burkina Faso',
  devise      text default 'FCFA',
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLE : categories
-- ============================================================
create table if not exists categories (
  id          uuid primary key default uuid_generate_v4(),
  boutique_id uuid references boutiques(id) on delete cascade,
  nom         text not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLE : produits
-- ============================================================
create table if not exists produits (
  id          uuid primary key default uuid_generate_v4(),
  boutique_id uuid references boutiques(id) on delete cascade,
  categorie_id uuid references categories(id) on delete set null,
  nom         text not null,
  description text,
  prix_achat  numeric(12, 2) not null default 0,
  prix_vente  numeric(12, 2) not null default 0,
  stock       integer not null default 0,
  stock_min   integer not null default 5,
  unite       text default 'unité',
  code_barre  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLE : fournisseurs
-- ============================================================
create table if not exists fournisseurs (
  id          uuid primary key default uuid_generate_v4(),
  boutique_id uuid references boutiques(id) on delete cascade,
  nom         text not null,
  telephone   text,
  email       text,
  ville       text,
  pays        text default 'Burkina Faso',
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLE : clients
-- ============================================================
create table if not exists clients (
  id          uuid primary key default uuid_generate_v4(),
  boutique_id uuid references boutiques(id) on delete cascade,
  nom         text not null,
  telephone   text,
  email       text,
  ville       text,
  solde_du    numeric(12, 2) default 0,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLE : achats (commandes fournisseur)
-- ============================================================
create table if not exists achats (
  id            uuid primary key default uuid_generate_v4(),
  boutique_id   uuid references boutiques(id) on delete cascade,
  fournisseur_id uuid references fournisseurs(id) on delete set null,
  date_achat    date not null default current_date,
  total         numeric(12, 2) not null default 0,
  statut        text not null default 'En attente' check (statut in ('En attente', 'Livré', 'Annulé')),
  notes         text,
  created_at    timestamptz default now()
);

create table if not exists achat_lignes (
  id          uuid primary key default uuid_generate_v4(),
  achat_id    uuid references achats(id) on delete cascade,
  produit_id  uuid references produits(id) on delete restrict,
  quantite    integer not null check (quantite > 0),
  prix_unit   numeric(12, 2) not null,
  sous_total  numeric(12, 2) generated always as (quantite * prix_unit) stored
);

-- ============================================================
-- TABLE : ventes
-- ============================================================
create table if not exists ventes (
  id          uuid primary key default uuid_generate_v4(),
  boutique_id uuid references boutiques(id) on delete cascade,
  client_id   uuid references clients(id) on delete set null,
  date_vente  date not null default current_date,
  total       numeric(12, 2) not null default 0,
  statut_paiement text not null default 'Payé' check (statut_paiement in ('Payé', 'Crédit', 'Partiel')),
  notes       text,
  created_at  timestamptz default now()
);

create table if not exists vente_lignes (
  id          uuid primary key default uuid_generate_v4(),
  vente_id    uuid references ventes(id) on delete cascade,
  produit_id  uuid references produits(id) on delete restrict,
  quantite    integer not null check (quantite > 0),
  prix_unit   numeric(12, 2) not null,
  sous_total  numeric(12, 2) generated always as (quantite * prix_unit) stored
);

-- ============================================================
-- TRIGGERS : mise à jour stock
-- ============================================================
create or replace function update_stock_after_vente()
returns trigger language plpgsql as $$
begin
  update produits
  set stock = stock - new.quantite,
      updated_at = now()
  where id = new.produit_id;
  return new;
end;
$$;

create or replace trigger trg_stock_vente
after insert on vente_lignes
for each row execute function update_stock_after_vente();

create or replace function update_stock_after_achat()
returns trigger language plpgsql as $$
begin
  if new.statut = 'Livré' and (old.statut is null or old.statut != 'Livré') then
    update produits p
    set stock = p.stock + al.quantite,
        updated_at = now()
    from achat_lignes al
    where al.achat_id = new.id and al.produit_id = p.id;
  end if;
  return new;
end;
$$;

create or replace trigger trg_stock_achat
after update of statut on achats
for each row execute function update_stock_after_achat();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table boutiques enable row level security;
alter table categories enable row level security;
alter table produits enable row level security;
alter table fournisseurs enable row level security;
alter table clients enable row level security;
alter table achats enable row level security;
alter table achat_lignes enable row level security;
alter table ventes enable row level security;
alter table vente_lignes enable row level security;

-- Policies boutiques
create policy "Propriétaire peut tout faire sur sa boutique"
  on boutiques for all
  using (auth.uid() = proprietaire_id)
  with check (auth.uid() = proprietaire_id);

-- Policies produits
create policy "Accès produits de sa boutique"
  on produits for all
  using (boutique_id in (select id from boutiques where proprietaire_id = auth.uid()));

-- Policies categories
create policy "Accès catégories de sa boutique"
  on categories for all
  using (boutique_id in (select id from boutiques where proprietaire_id = auth.uid()));

-- Policies fournisseurs
create policy "Accès fournisseurs de sa boutique"
  on fournisseurs for all
  using (boutique_id in (select id from boutiques where proprietaire_id = auth.uid()));

-- Policies clients
create policy "Accès clients de sa boutique"
  on clients for all
  using (boutique_id in (select id from boutiques where proprietaire_id = auth.uid()));

-- Policies achats
create policy "Accès achats de sa boutique"
  on achats for all
  using (boutique_id in (select id from boutiques where proprietaire_id = auth.uid()));

create policy "Accès lignes achats de sa boutique"
  on achat_lignes for all
  using (achat_id in (select id from achats where boutique_id in (
    select id from boutiques where proprietaire_id = auth.uid()
  )));

-- Policies ventes
create policy "Accès ventes de sa boutique"
  on ventes for all
  using (boutique_id in (select id from boutiques where proprietaire_id = auth.uid()));

create policy "Accès lignes ventes de sa boutique"
  on vente_lignes for all
  using (vente_id in (select id from ventes where boutique_id in (
    select id from boutiques where proprietaire_id = auth.uid()
  )));
