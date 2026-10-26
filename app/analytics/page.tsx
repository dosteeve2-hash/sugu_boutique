'use client'

import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts'
import { TrendingUp, Users, Package, CreditCard, BarChart2 } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Vente, Produit, Client } from '@/lib/types'

const NAVY   = '#1F3A2B'
const GOLD   = '#E3A00F'
const CYAN   = '#E3A00F'
const GREEN  = '#91D9A3'
const BORDER = '#496653'
const BG2    = '#263F30'

const PAIEMENT_COLORS: Record<string, string> = {
  'Espèces':      GREEN,
  'Orange Money': '#FF6B35',
  'Wave':         '#4A90D9',
  'Moov Money':   CYAN,
  'Crédit':       '#EF4444',
}

const TABS = ['Tendances', 'Produits', 'Clients', 'Paiements'] as const
type Tab = typeof TABS[number]

const MOIS_LABEL = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
const PIE_COLORS = [GOLD, CYAN, GREEN, '#9b59b6', '#e67e22', '#3498db', '#1abc9c', '#e74c3c']

function KpiCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={16} style={{ color }} />
        <span style={{ fontSize: '0.75rem', color: '#D9DEC9' }}>{label}</span>
      </div>
      <span style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</span>
    </div>
  )
}

export default function Analytics() {
  const [ventes] = usePersistedBoutique<Vente[]>('ventes', [])
  const [produits] = usePersistedBoutique<Produit[]>('produits', [])
  const [clients] = usePersistedBoutique<Client[]>('clients', [])
  const [tab, setTab] = useState<Tab>('Tendances')

  const stats = useMemo(() => {
    const ca = ventes.reduce((s, v) => s + v.total, 0)
    const nbVentes = ventes.length
    const nbClientsActifs = new Set(ventes.filter(v => v.clientId).map(v => v.clientId)).size

    // Tendance journalière 30j
    const today = new Date()
    const jour30: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const k = d.toISOString().slice(0, 10)
      jour30[k] = 0
    }
    ventes.forEach(v => {
      const k = v.date.slice(0, 10)
      if (k in jour30) jour30[k] += v.total
    })
    const tendanceData = Object.entries(jour30).map(([date, total]) => ({ jour: date.slice(5), total }))

    // Top produits
    const prodMap: Record<string, { nom: string; revenu: number; qte: number; categorie: string }> = {}
    ventes.forEach(v => {
      v.lignes.forEach(l => {
        const key = String(l.produitId)
        if (!prodMap[key]) {
          const p = produits.find(x => x.id === l.produitId)
          prodMap[key] = { nom: l.nom, revenu: 0, qte: 0, categorie: p?.categorie ?? 'Autre' }
        }
        prodMap[key].revenu += l.prixUnit * l.quantite
        prodMap[key].qte    += l.quantite
      })
    })
    const topProduits = Object.values(prodMap).sort((a, b) => b.revenu - a.revenu).slice(0, 10)

    // PieChart catégories
    const catMap: Record<string, number> = {}
    Object.values(prodMap).forEach(p => { catMap[p.categorie] = (catMap[p.categorie] ?? 0) + p.revenu })
    const catData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

    // Top clients
    const clientRevenu: Record<string, number> = {}
    ventes.forEach(v => {
      if (v.clientId) clientRevenu[String(v.clientId)] = (clientRevenu[String(v.clientId)] ?? 0) + v.total
    })
    const topClients = Object.entries(clientRevenu)
      .map(([id, revenu]) => {
        const c = clients.find(x => x.id === Number(id))
        return { nom: c?.nom ?? `Client #${id}`, revenu }
      })
      .sort((a, b) => b.revenu - a.revenu).slice(0, 5)

    // Paiements
    const paiMap: Record<string, number> = {}
    ventes.forEach(v => { paiMap[v.modePaiement] = (paiMap[v.modePaiement] ?? 0) + v.total })
    const paiData = Object.entries(paiMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

    // Mois 6j
    const moisMap: Record<string, number> = {}
    ventes.forEach(v => { const k = v.date.slice(0, 7); moisMap[k] = (moisMap[k] ?? 0) + v.total })
    const moisData = Object.entries(moisMap)
      .sort(([a], [b]) => a.localeCompare(b)).slice(-6)
      .map(([k, total]) => { const [, m] = k.split('-'); return { mois: MOIS_LABEL[Number(m) - 1] ?? m, total } })

    return { ca, nbVentes, nbClientsActifs, tendanceData, topProduits, catData, topClients, paiData, moisData }
  }, [ventes, produits, clients])

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: GOLD, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={24} /> Analytics
        </h1>
        <p style={{ color: '#D9DEC9', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
          Analyse détaillée de vos performances commerciales
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <KpiCard label="Chiffre d'affaires" value={`${stats.ca.toLocaleString('fr-FR')} FCFA`} icon={TrendingUp} color={GOLD} />
        <KpiCard label="Nb de ventes" value={stats.nbVentes.toLocaleString('fr-FR')} icon={Package} color={CYAN} />
        <KpiCard label="Clients actifs" value={stats.nbClientsActifs.toString()} icon={Users} color={GREEN} />
        <KpiCard
          label="Ticket moyen"
          value={stats.nbVentes > 0 ? `${Math.round(stats.ca / stats.nbVentes).toLocaleString('fr-FR')} FCFA` : '—'}
          icon={CreditCard}
          color="#9b59b6"
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '0.5rem 1rem', borderRadius: 8,
              border: `1px solid ${tab === t ? GOLD : BORDER}`,
              background: tab === t ? 'rgba(227,160,15,0.12)' : BG2,
              color: tab === t ? GOLD : '#D9DEC9',
              fontWeight: tab === t ? 700 : 400, fontSize: '0.875rem', cursor: 'pointer',
            }}
          >{t}</button>
        ))}
      </div>

      {tab === 'Tendances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F2EBCF', margin: '0 0 1rem' }}>Ventes — 30 derniers jours</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={stats.tendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="jour" tick={{ fill: '#D9DEC9', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#D9DEC9', fontSize: 11 }} tickLine={false} tickFormatter={(v) => (v as number).toLocaleString('fr-FR')} />
                <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8 }} labelStyle={{ color: '#D9DEC9' }} formatter={(v) => [`${(v as number).toLocaleString('fr-FR')} FCFA`, 'Ventes']} />
                <Line type="monotone" dataKey="total" stroke={GOLD} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F2EBCF', margin: '0 0 1rem' }}>Évolution mensuelle (6 mois)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.moisData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="mois" tick={{ fill: '#D9DEC9', fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fill: '#D9DEC9', fontSize: 11 }} tickLine={false} tickFormatter={(v) => (v as number).toLocaleString('fr-FR')} />
                <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8 }} formatter={(v) => [`${(v as number).toLocaleString('fr-FR')} FCFA`, 'CA']} />
                <Bar dataKey="total" fill={CYAN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'Produits' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F2EBCF', margin: '0 0 1rem' }}>Top 10 produits par revenus</h2>
            {stats.topProduits.length === 0 ? (
              <p style={{ color: '#D9DEC9', fontSize: '0.875rem' }}>Aucune vente enregistrée</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {stats.topProduits.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: GOLD, fontWeight: 700, fontSize: '0.8rem', width: 20, textAlign: 'right', flexShrink: 0 }}>#{i+1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', color: '#F2EBCF', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nom}</div>
                      <div style={{ fontSize: '0.75rem', color: '#D9DEC9' }}>{p.categorie} · {p.qte} unités vendues</div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: GREEN, flexShrink: 0 }}>{p.revenu.toLocaleString('fr-FR')} F</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F2EBCF', margin: '0 0 1rem' }}>Revenus par catégorie</h2>
            {stats.catData.length === 0 ? (
              <p style={{ color: '#D9DEC9', fontSize: '0.875rem' }}>Aucune donnée</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={stats.catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} strokeWidth={0}>
                      {stats.catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8 }} formatter={(v) => [`${(v as number).toLocaleString('fr-FR')} FCFA`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
                  {stats.catData.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: '#D9DEC9', flex: 1 }}>{c.name}</span>
                      <span style={{ color: '#F2EBCF', fontWeight: 600 }}>{c.value.toLocaleString('fr-FR')} F</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'Clients' && (
        <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F2EBCF', margin: '0 0 1.25rem' }}>Top 5 clients par chiffre d&apos;affaires</h2>
          {stats.topClients.length === 0 ? (
            <p style={{ color: '#D9DEC9', fontSize: '0.875rem' }}>Aucun client associé aux ventes</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.topClients.map((c, i) => {
                const maxRev = stats.topClients[0].revenu
                const pct = maxRev > 0 ? (c.revenu / maxRev) * 100 : 0
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#F2EBCF', fontWeight: 600 }}>
                        <span style={{ color: GOLD, marginRight: '0.4rem' }}>#{i+1}</span>{c.nom}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: GREEN, fontWeight: 700 }}>{c.revenu.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div style={{ height: 6, background: BORDER, borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: GOLD, borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'Paiements' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F2EBCF', margin: '0 0 1rem' }}>Répartition modes de paiement</h2>
            {stats.paiData.length === 0 ? (
              <p style={{ color: '#D9DEC9', fontSize: '0.875rem' }}>Aucune donnée</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={stats.paiData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                      {stats.paiData.map((d, i) => <Cell key={i} fill={PAIEMENT_COLORS[d.name] ?? PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8 }} formatter={(v) => [`${(v as number).toLocaleString('fr-FR')} FCFA`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {stats.paiData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: PAIEMENT_COLORS[d.name] ?? PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: '#D9DEC9', flex: 1 }}>{d.name}</span>
                      <span style={{ color: '#F2EBCF', fontWeight: 600 }}>{d.value.toLocaleString('fr-FR')} F</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div style={{ background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F2EBCF', margin: '0 0 1rem' }}>Volume par mode de paiement</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.paiData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                <XAxis type="number" tick={{ fill: '#D9DEC9', fontSize: 11 }} tickLine={false} tickFormatter={(v) => (v as number).toLocaleString('fr-FR')} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#D9DEC9', fontSize: 11 }} tickLine={false} width={90} />
                <Tooltip contentStyle={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8 }} formatter={(v) => [`${(v as number).toLocaleString('fr-FR')} FCFA`, 'Total']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {stats.paiData.map((d, i) => <Cell key={i} fill={PAIEMENT_COLORS[d.name] ?? PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
