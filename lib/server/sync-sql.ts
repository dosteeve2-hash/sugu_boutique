import { SCHEMAS_ENTITES } from '@/lib/sync/schemas'
import type { EnregistrementTire, Entite, EntiteSync, Op, ResultatOp } from '@/lib/sync/types'

export type Requete = { text: string; values: unknown[] }
export type Executeur = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>
}

type TypeChamp = 'texte' | 'nombre' | 'texteNul' | 'nombreNul'
type Champ = { cle: string; col: string; t: TypeChamp; absent?: 'undefined' | 'null' }

const CHAMPS: Record<Exclude<EntiteSync, 'boutiques' | 'ventes'>, { table: string; champs: Champ[] }> = {
  produits: {
    table: 'produits',
    champs: [
      { cle: 'nom', col: 'nom', t: 'texte' },
      { cle: 'categorie', col: 'categorie', t: 'texte' },
      { cle: 'prixAchat', col: 'prix_achat', t: 'nombre' },
      { cle: 'prixVente', col: 'prix_vente', t: 'nombre' },
      { cle: 'stock', col: 'stock', t: 'nombre' },
      { cle: 'stockMin', col: 'stock_min', t: 'nombre' },
      { cle: 'unite', col: 'unite', t: 'texteNul', absent: 'undefined' },
    ],
  },
  clients: {
    table: 'clients',
    champs: [
      { cle: 'nom', col: 'nom', t: 'texte' },
      { cle: 'telephone', col: 'telephone', t: 'texte' },
      { cle: 'ville', col: 'ville', t: 'texte' },
      { cle: 'soldeDu', col: 'solde_du', t: 'nombre' },
      { cle: 'totalAchats', col: 'total_achats', t: 'nombre' },
      { cle: 'derniereVisite', col: 'derniere_visite', t: 'texte' },
    ],
  },
  fournisseurs: {
    table: 'fournisseurs',
    champs: [
      { cle: 'nom', col: 'nom', t: 'texte' },
      { cle: 'contact', col: 'contact', t: 'texte' },
      { cle: 'ville', col: 'ville', t: 'texte' },
      { cle: 'produits', col: 'produits', t: 'texte' },
      { cle: 'totalAchats', col: 'total_achats', t: 'nombre' },
      { cle: 'derniereCommande', col: 'derniere_commande', t: 'texte' },
    ],
  },
  achats: {
    table: 'achats',
    champs: [
      { cle: 'fournisseurId', col: 'fournisseur_id', t: 'nombreNul', absent: 'null' },
      { cle: 'fournisseur', col: 'fournisseur', t: 'texte' },
      { cle: 'produitId', col: 'produit_id', t: 'nombreNul', absent: 'null' },
      { cle: 'produit', col: 'produit', t: 'texte' },
      { cle: 'quantite', col: 'quantite', t: 'nombre' },
      { cle: 'prixUnit', col: 'prix_unit', t: 'nombre' },
      { cle: 'total', col: 'total', t: 'nombre' },
      { cle: 'statut', col: 'statut', t: 'texte' },
      { cle: 'date', col: 'date', t: 'texte' },
    ],
  },
  paiements: {
    table: 'paiements',
    champs: [
      { cle: 'clientId', col: 'client_id', t: 'nombre' },
      { cle: 'montant', col: 'montant', t: 'nombre' },
      { cle: 'mode', col: 'mode', t: 'texte' },
      { cle: 'date', col: 'date', t: 'texte' },
    ],
  },
}

const CHAMPS_VENTES: Champ[] = [
  { cle: 'clientId', col: 'client_id', t: 'nombreNul', absent: 'null' },
  { cle: 'client', col: 'client', t: 'texte' },
  { cle: 'total', col: 'total', t: 'nombre' },
  { cle: 'modePaiement', col: 'mode_paiement', t: 'texte' },
  { cle: 'statut', col: 'statut', t: 'texte' },
  { cle: 'date', col: 'date', t: 'texte' },
  { cle: 'satisfaction', col: 'satisfaction', t: 'texteNul', absent: 'null' },
]

const CHAMPS_BOUTIQUES: Champ[] = [
  { cle: 'nom', col: 'nom', t: 'texte' },
  { cle: 'type', col: 'type', t: 'texte' },
  { cle: 'emoji', col: 'emoji', t: 'texte' },
  { cle: 'couleur', col: 'couleur', t: 'texte' },
  { cle: 'dateCreation', col: 'date_creation', t: 'texte' },
]

function valeur(donnees: Record<string, unknown>, champ: Champ): unknown {
  const v = donnees[champ.cle]
  return v === undefined || v === null ? null : v
}

/** Un horodatage client ne peut pas être dans le futur : une horloge de téléphone déréglée ne gagne pas à tous les coups. */
const TS_BORNE = 'least($TS::timestamptz, now())'

export function construireUpsert(
  entite: Exclude<EntiteSync, 'boutiques'>,
  userId: string,
  boutiqueId: string,
  id: string,
  donnees: Record<string, unknown>,
  at: string
): Requete {
  const champs = entite === 'ventes' ? CHAMPS_VENTES : CHAMPS[entite].champs
  const table = entite === 'ventes' ? 'ventes' : CHAMPS[entite].table
  const cols = ['boutique_id', 'id', 'user_id', ...champs.map((c) => c.col), 'client_ts']
  const values: unknown[] = [boutiqueId, id, userId, ...champs.map((c) => valeur(donnees, c)), at]
  const marques = [
    '$1::text',
    '$2::bigint',
    '$3::text',
    ...champs.map((c, i) => `$${i + 4}::${c.t === 'texte' || c.t === 'texteNul' ? 'text' : 'bigint'}`),
    TS_BORNE.replace('$TS', `$${values.length}`),
  ]
  const maj = [...champs.map((c) => `${c.col} = excluded.${c.col}`), 'client_ts = excluded.client_ts', 'updated_at = now()', 'deleted_at = null']
  const text =
    `insert into ${table} (${cols.join(', ')}) ` +
    `select ${marques.join(', ')} ` +
    `where exists (select 1 from boutiques b where b.id = $1 and b.user_id = $3 and b.deleted_at is null) ` +
    `on conflict (boutique_id, id) do update set ${maj.join(', ')} ` +
    `where ${table}.user_id = $3 and ${table}.client_ts <= excluded.client_ts`
  return { text, values }
}

export function construireSuppression(
  entite: Exclude<EntiteSync, 'boutiques'>,
  userId: string,
  boutiqueId: string,
  id: string,
  at: string
): Requete {
  const table = entite === 'ventes' ? 'ventes' : CHAMPS[entite].table
  return {
    text:
      `update ${table} set deleted_at = now(), updated_at = now(), client_ts = ${TS_BORNE.replace('$TS', '$4')} ` +
      `where boutique_id = $1 and id = $2 and user_id = $3 and client_ts <= ${TS_BORNE.replace('$TS', '$4')}`,
    values: [boutiqueId, id, userId, at],
  }
}

export function construireUpsertBoutique(userId: string, id: string, donnees: Record<string, unknown>, at: string): Requete {
  const cols = ['id', 'user_id', ...CHAMPS_BOUTIQUES.map((c) => c.col), 'client_ts']
  const values: unknown[] = [id, userId, ...CHAMPS_BOUTIQUES.map((c) => valeur(donnees, c)), at]
  const marques = values.map((_, i) => `$${i + 1}`)
  marques[marques.length - 1] = TS_BORNE.replace('$TS', `$${values.length}`)
  const maj = [
    ...CHAMPS_BOUTIQUES.map((c) => `${c.col} = excluded.${c.col}`),
    'client_ts = excluded.client_ts',
    'updated_at = now()',
    'deleted_at = null',
  ]
  return {
    text:
      `insert into boutiques (${cols.join(', ')}) values (${marques.join(', ')}) ` +
      `on conflict (id) do update set ${maj.join(', ')} where boutiques.user_id = $2 and boutiques.client_ts <= excluded.client_ts`,
    values,
  }
}

export function construireSuppressionBoutique(userId: string, id: string, at: string): Requete {
  return {
    text:
      `update boutiques set deleted_at = now(), updated_at = now(), client_ts = ${TS_BORNE.replace('$TS', '$3')} ` +
      `where id = $1 and user_id = $2 and client_ts <= ${TS_BORNE.replace('$TS', '$3')}`,
    values: [id, userId, at],
  }
}

type LigneVente = { produitId: number; nom: string; quantite: number; prixUnit: number; prixAchat?: number }

async function remplacerLignesVente(
  db: Executeur,
  userId: string,
  boutiqueId: string,
  id: string,
  lignes: LigneVente[],
  date: string
) {
  await db.query('delete from vente_lignes where boutique_id = $1 and vente_id = $2 and user_id = $3', [boutiqueId, id, userId])
  await db.query(
    "delete from mouvements_stock where boutique_id = $1 and motif = 'vente' and source_id = $2 and user_id = $3",
    [boutiqueId, id, userId]
  )
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i]
    await db.query(
      'insert into vente_lignes (boutique_id, vente_id, position, user_id, produit_id, nom, quantite, prix_unit, prix_achat) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [boutiqueId, id, i, userId, l.produitId, l.nom, l.quantite, l.prixUnit, l.prixAchat ?? null]
    )
    await db.query(
      "insert into mouvements_stock (boutique_id, user_id, motif, source_id, produit_id, delta, date) values ($1,$2,'vente',$3,$4,$5,$6) " +
        'on conflict (boutique_id, motif, source_id, produit_id) do update set delta = mouvements_stock.delta + excluded.delta',
      [boutiqueId, userId, id, l.produitId, -l.quantite, date]
    )
  }
}

async function synchroniserMouvementAchat(
  db: Executeur,
  userId: string,
  boutiqueId: string,
  id: string,
  donnees: Record<string, unknown>
) {
  await db.query(
    "delete from mouvements_stock where boutique_id = $1 and motif = 'achat' and source_id = $2 and user_id = $3",
    [boutiqueId, id, userId]
  )
  if (donnees.statut === 'Livré' && typeof donnees.produitId === 'number' && typeof donnees.quantite === 'number') {
    await db.query(
      "insert into mouvements_stock (boutique_id, user_id, motif, source_id, produit_id, delta, date) values ($1,$2,'achat',$3,$4,$5,$6) on conflict do nothing",
      [boutiqueId, userId, id, donnees.produitId, donnees.quantite, String(donnees.date ?? '')]
    )
  }
}

/** Applique une opération déjà dédoublonnée. Toutes les requêtes sont liées à userId. */
export async function appliquerOp(db: Executeur, userId: string, op: Op): Promise<ResultatOp['statut']> {
  if (op.entite === 'boutiques') {
    if (op.type === 'delete') {
      const r = construireSuppressionBoutique(userId, op.id, op.at)
      await db.query(r.text, r.values)
      return 'applique'
    }
    const parse = SCHEMAS_ENTITES.boutiques.safeParse(op.data)
    if (!parse.success || parse.data.id !== op.id) return 'invalide'
    const r = construireUpsertBoutique(userId, op.id, parse.data, op.at)
    const res = await db.query(r.text, r.values)
    if (res.rowCount === 0) {
      const proprio = await db.query('select user_id from boutiques where id = $1', [op.id])
      return proprio.rows[0] && proprio.rows[0].user_id !== userId ? 'refuse' : 'ignore'
    }
    return 'applique'
  }

  const entite = op.entite
  if (op.type === 'delete') {
    const r = construireSuppression(entite, userId, op.boutiqueId, op.id, op.at)
    await db.query(r.text, r.values)
    if (entite === 'ventes') {
      await db.query(
        "delete from mouvements_stock where boutique_id = $1 and motif = 'vente' and source_id = $2 and user_id = $3",
        [op.boutiqueId, op.id, userId]
      )
    }
    if (entite === 'achats') {
      await db.query(
        "delete from mouvements_stock where boutique_id = $1 and motif = 'achat' and source_id = $2 and user_id = $3",
        [op.boutiqueId, op.id, userId]
      )
    }
    return 'applique'
  }

  const schema = SCHEMAS_ENTITES[entite]
  const parse = schema.safeParse(op.data)
  if (!parse.success) return 'invalide'
  const donnees = parse.data as Record<string, unknown>
  if (String(donnees.id) !== op.id) return 'invalide'

  const r = construireUpsert(entite, userId, op.boutiqueId, op.id, donnees, op.at)
  const res = await db.query(r.text, r.values)
  if (res.rowCount === 0) {
    const proprio = await db.query('select user_id from boutiques where id = $1', [op.boutiqueId])
    if (!proprio.rows[0] || proprio.rows[0].user_id !== userId) return 'refuse'
    return 'ignore'
  }
  if (entite === 'ventes') {
    await remplacerLignesVente(db, userId, op.boutiqueId, op.id, donnees.lignes as LigneVente[], String(donnees.date ?? ''))
  } else if (entite === 'achats') {
    await synchroniserMouvementAchat(db, userId, op.boutiqueId, op.id, donnees)
  }
  return 'applique'
}

export type ClientTransaction = Executeur & { release: () => void }

/** Applique un lot : dédoublonnage par opId, un savepoint par opération, un échec n'empêche pas les autres. */
export async function appliquerLot(
  obtenir: () => Promise<ClientTransaction>,
  userId: string,
  ops: Op[]
): Promise<ResultatOp[]> {
  const db = await obtenir()
  const resultats: ResultatOp[] = []
  try {
    await db.query('begin')
    for (const op of ops) {
      const vu = await db.query(
        'insert into sync_ops (op_id, user_id) values ($1, $2) on conflict (op_id) do nothing returning op_id',
        [op.opId, userId]
      )
      if (vu.rowCount === 0) {
        resultats.push({ opId: op.opId, statut: 'ignore' })
        continue
      }
      await db.query('savepoint op')
      try {
        const statut = await appliquerOp(db, userId, op)
        await db.query('release savepoint op')
        resultats.push({ opId: op.opId, statut })
      } catch {
        await db.query('rollback to savepoint op')
        await db.query('release savepoint op')
        resultats.push({ opId: op.opId, statut: 'invalide' })
      }
    }
    await db.query('commit')
    return resultats
  } catch (e) {
    await db.query('rollback').catch(() => undefined)
    throw e
  } finally {
    db.release()
  }
}

function convertir(ligne: Record<string, unknown>, champs: Champ[]): Record<string, unknown> {
  const sortie: Record<string, unknown> = {}
  for (const c of champs) {
    const brut = ligne[c.col]
    if (brut === null || brut === undefined) {
      if (c.absent === 'null') sortie[c.cle] = null
      continue
    }
    sortie[c.cle] = c.t === 'nombre' || c.t === 'nombreNul' ? Number(brut) : String(brut)
  }
  return sortie
}

export async function tirerChangements(
  db: Executeur,
  userId: string,
  depuis: string
): Promise<{ heureServeur: string; enregistrements: EnregistrementTire[] }> {
  const maintenant = await db.query('select now() as t')
  const heureServeur = new Date(String(maintenant.rows[0].t)).toISOString()
  const enregistrements: EnregistrementTire[] = []

  const boutiques = await db.query(
    'select *, (deleted_at is not null) as supprime from boutiques where user_id = $1 and updated_at > $2::timestamptz',
    [userId, depuis]
  )
  for (const b of boutiques.rows) {
    enregistrements.push({
      entite: 'boutiques',
      boutiqueId: String(b.id),
      id: String(b.id),
      supprime: Boolean(b.supprime),
      data: b.supprime ? undefined : { id: String(b.id), ...convertir(b, CHAMPS_BOUTIQUES) },
    })
  }

  const entites = Object.keys(CHAMPS) as Array<Exclude<EntiteSync, 'boutiques' | 'ventes'>>
  for (const entite of entites) {
    const spec = CHAMPS[entite]
    const res = await db.query(
      `select t.*, (t.deleted_at is not null) as supprime from ${spec.table} t ` +
        'join boutiques b on b.id = t.boutique_id and b.user_id = t.user_id and b.deleted_at is null ' +
        'where t.user_id = $1 and t.updated_at > $2::timestamptz',
      [userId, depuis]
    )
    for (const l of res.rows) {
      enregistrements.push({
        entite: entite as Entite,
        boutiqueId: String(l.boutique_id),
        id: String(l.id),
        supprime: Boolean(l.supprime),
        data: l.supprime ? undefined : { id: Number(l.id), ...convertir(l, spec.champs) },
      })
    }
  }

  const ventes = await db.query(
    'select v.*, (v.deleted_at is not null) as supprime, ' +
      "coalesce((select json_agg(json_build_object('produitId', li.produit_id, 'nom', li.nom, 'quantite', li.quantite, 'prixUnit', li.prix_unit, 'prixAchat', li.prix_achat) order by li.position) " +
      "from vente_lignes li where li.boutique_id = v.boutique_id and li.vente_id = v.id and li.user_id = v.user_id), '[]'::json) as lignes " +
      'from ventes v join boutiques b on b.id = v.boutique_id and b.user_id = v.user_id and b.deleted_at is null ' +
      'where v.user_id = $1 and v.updated_at > $2::timestamptz',
    [userId, depuis]
  )
  for (const l of ventes.rows) {
    const lignes = (l.lignes as Array<Record<string, unknown>>).map((x) => ({
      produitId: Number(x.produitId),
      nom: String(x.nom),
      quantite: Number(x.quantite),
      prixUnit: Number(x.prixUnit),
      ...(x.prixAchat === null || x.prixAchat === undefined ? {} : { prixAchat: Number(x.prixAchat) }),
    }))
    enregistrements.push({
      entite: 'ventes',
      boutiqueId: String(l.boutique_id),
      id: String(l.id),
      supprime: Boolean(l.supprime),
      data: l.supprime ? undefined : { id: Number(l.id), ...convertir(l, CHAMPS_VENTES), lignes },
    })
  }

  return { heureServeur, enregistrements }
}
