'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Store, Smile } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Produit, Vente, Client, Achat } from '@/lib/types'
import EmptyState from '@/components/EmptyState'
import { useLangue } from '@/components/LangueProvider'
import { useBoutique } from '@/components/BoutiqueProvider'
import CountUp from '@/components/CountUp'
import RapportJour from '@/components/RapportJour'

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const today = () => new Date().toISOString().slice(0, 10)

export default function Dashboard() {
  const { t } = useLangue()
  const { boutiqueActive } = useBoutique()
  const [produits, , loadedP] = usePersistedBoutique<Produit[]>('produits', [])
  const [ventes, , loadedV] = usePersistedBoutique<Vente[]>('ventes', [])
  const [clients, , loadedC] = usePersistedBoutique<Client[]>('clients', [])
  const [achats, , loadedA] = usePersistedBoutique<Achat[]>('achats', [])
  const loaded = loadedP && loadedV && loadedC && loadedA

  if (!loaded) return null

  const aucuneDonnee = produits.length === 0 && ventes.length === 0 && clients.length === 0

  const dateAujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const ventesAujourdhui = ventes.filter((v) => v.date === today()).reduce((a, v) => a + v.total, 0)
  const achatsAujourdhui = achats.filter((a) => a.date === today()).reduce((a, c) => a + c.total, 0)
  const beneficeJour = ventesAujourdhui - achatsAujourdhui
  const stockFaible = produits.filter((p) => p.stock < p.stockMin).length
  const clientsCredit = clients.filter((c) => c.soldeDu > 0).length

  const septJoursAgo = new Date()
  septJoursAgo.setDate(septJoursAgo.getDate() - 7)
  const ventesSemaine = ventes.filter((v) => new Date(v.date) >= septJoursAgo && v.satisfaction)
  const pctBien = ventesSemaine.length > 0 ? Math.round((ventesSemaine.filter((v) => v.satisfaction === 'bien').length / ventesSemaine.length) * 100) : null

  const kpis = [
    { label: 'Ventes du Jour', value: ventesAujourdhui, format: (v: number) => `${Math.round(v).toLocaleString('fr-FR')} FCFA`, sub: `${ventes.filter((v) => v.date === today()).length} transaction(s)`, color: '#D4AF37' },
    { label: 'Produits en Stock', value: produits.length, format: (v: number) => `${Math.round(v)}`, sub: `${stockFaible} en rupture`, color: '#00BCD4' },
    { label: 'Clients', value: clients.length, format: (v: number) => `${Math.round(v)}`, sub: `${clientsCredit} avec crédit`, color: '#D4AF37' },
    { label: 'Bénéfice du Jour', value: beneficeJour, format: (v: number) => `${Math.round(v).toLocaleString('fr-FR')} FCFA`, sub: ventesAujourdhui > 0 ? `Marge: ${Math.round((beneficeJour / ventesAujourdhui) * 100)}%` : '—', color: '#22d98a' },
  ]

  const salesData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const iso = d.toISOString().slice(0, 10)
    const total = ventes.filter((v) => v.date === iso).reduce((a, v) => a + v.total, 0)
    return { jour: JOURS[d.getDay()], ventes: total }
  })

  const produitStats = new Map<number, { nom: string; ventes: number; revenue: number }>()
  ventes.forEach((v) => {
    v.lignes.forEach((l) => {
      const e = produitStats.get(l.produitId) ?? { nom: l.nom, ventes: 0, revenue: 0 }
      e.ventes += l.quantite
      e.revenue += l.quantite * l.prixUnit
      produitStats.set(l.produitId, e)
    })
  })
  const topProduits = Array.from(produitStats.values()).sort((a, b) => b.ventes - a.ventes).slice(0, 4)

  const alertes = [
    ...produits.filter((p) => p.stock < p.stockMin).map((p) => ({ message: `${p.nom} — stock faible (${p.stock} restant${p.stock > 1 ? 's' : ''})`, type: p.stock === 0 ? 'error' : 'warn' as const })),
    ...clients.filter((c) => c.soldeDu > 0).map((c) => ({ message: `${c.nom} — solde dû de ${c.soldeDu.toLocaleString('fr-FR')} FCFA`, type: 'info' as const })),
  ].slice(0, 6)

  return (
    <div>
      <div
        className="sugu-kente-bg"
        style={{ marginBottom: '1.5rem', borderRadius: 16, padding: '1.25rem 1.5rem', border: '1px solid #16233d' }}
      >
        <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFeatureSettings: '"kern" 1' }}>
          {t.bonjour} {boutiqueActive?.emoji} {boutiqueActive?.nom} 👋
        </h2>
        <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.35rem 0 0', textTransform: 'capitalize' }}>
          {dateAujourdhui}
        </p>
        {pctBien !== null && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', background: 'rgba(34,217,138,0.1)', color: '#22d98a', padding: '0.3rem 0.7rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
            <Smile size={14} /> {pctBien}% {t.satisfactionSemaine}
          </div>
        )}
      </div>

      {aucuneDonnee ? (
        <EmptyState
          icon={Store}
          title="Bienvenue sur SUGU"
          message="Commencez par ajouter vos produits, puis enregistrez vos ventes et achats. Votre tableau de bord se remplira automatiquement."
        />
      ) : (
        <>
          <div className="sugu-kpi-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                style={{ background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: `1px solid ${kpi.color}22` }}
              >
                <p style={{ color: '#4e5f82', fontSize: '0.75rem', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {kpi.label}
                </p>
                <p style={{ color: kpi.color, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                  <CountUp value={kpi.value} format={kpi.format} />
                </p>
                <p style={{ color: '#9ba8c4', fontSize: '0.72rem', margin: 0 }}>{kpi.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="sugu-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: '1px solid #16233d' }}>
              <h3 style={{ color: '#f5f0e8', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem' }}>
                Ventes — 7 Derniers Jours
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#16233d" />
                  <XAxis dataKey="jour" stroke="#4e5f82" fontSize={12} />
                  <YAxis stroke="#4e5f82" fontSize={12} tickFormatter={(v: number) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(v: number) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Ventes']}
                    contentStyle={{ background: '#070e1f', border: '1px solid #16233d', borderRadius: 8, color: '#f5f0e8' }}
                  />
                  <Line type="monotone" dataKey="ventes" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: '1px solid #16233d' }}>
              <h3 style={{ color: '#f5f0e8', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem' }}>
                Top Produits
              </h3>
              {topProduits.length === 0 ? (
                <p style={{ color: '#4e5f82', fontSize: '0.82rem' }}>Aucune vente enregistrée.</p>
              ) : (
                topProduits.map((p, i) => (
                  <motion.div
                    key={p.nom}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 0',
                      borderBottom: i < topProduits.length - 1 ? '1px solid #16233d' : 'none',
                    }}
                  >
                    <div>
                      <p style={{ color: '#9ba8c4', fontSize: '0.82rem', margin: 0 }}>{p.nom}</p>
                      <p style={{ color: '#4e5f82', fontSize: '0.7rem', margin: '0.1rem 0 0' }}>
                        {p.revenue.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <span style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', padding: '0.15rem 0.5rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700 }}>
                      {p.ventes}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div style={{ background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: '1px solid #16233d' }}>
            <h3 style={{ color: '#f5f0e8', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
              Alertes
            </h3>
            {alertes.length === 0 ? (
              <p style={{ color: '#22d98a', fontSize: '0.82rem', margin: 0 }}>Tout est en ordre — aucune alerte.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {alertes.map((a, i) => {
                  const colors: Record<string, string> = { error: '#ef4444', warn: '#f0a832', info: '#00BCD4' }
                  const c = colors[a.type]
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 0.75rem',
                        background: `${c}11`,
                        borderRadius: 8,
                        borderLeft: `3px solid ${c}`,
                      }}
                    >
                      <span style={{ color: c, fontSize: '0.82rem' }}>{a.message}</span>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {!aucuneDonnee && produits.length === 0 && (
        <p style={{ color: '#4e5f82', fontSize: '0.8rem', marginTop: '1rem' }}>
          <Link href="/produits" style={{ color: '#00BCD4' }}>Ajoutez vos produits</Link> pour activer le suivi de stock.
        </p>
      )}

      {/* Rapport journalier */}
      <RapportJour />
    </div>
  )
}
