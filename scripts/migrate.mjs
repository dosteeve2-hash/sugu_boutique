import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'

if (!process.env.DATABASE_URL && existsSync('.env.local')) {
  for (const ligne of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = ligne.match(/^([A-Z_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
if (!process.env.DATABASE_URL) {
  process.stderr.write('DATABASE_URL manquante\n')
  process.exit(1)
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
await client.query(
  'create table if not exists schema_migrations (nom text primary key, applique_le timestamptz not null default now())'
)
const dossier = 'db/migrations'
for (const fichier of readdirSync(dossier).filter((f) => f.endsWith('.sql')).sort()) {
  const deja = await client.query('select 1 from schema_migrations where nom = $1', [fichier])
  if (deja.rowCount) continue
  await client.query('begin')
  try {
    await client.query(readFileSync(join(dossier, fichier), 'utf8'))
    await client.query('insert into schema_migrations (nom) values ($1)', [fichier])
    await client.query('commit')
    process.stdout.write(`appliquée : ${fichier}\n`)
  } catch (e) {
    await client.query('rollback')
    process.stderr.write(`échec ${fichier} : ${e instanceof Error ? e.message : 'erreur'}\n`)
    process.exit(1)
  }
}
await client.end()
process.stdout.write('migrations à jour\n')
