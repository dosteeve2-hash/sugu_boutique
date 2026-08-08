'use client'

import { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, PieChart, Pie, Cell, LineChart,
} from 'recharts'
import { TrendingUp, ShoppingBag, Users, Package, BarChart2, Download, Star } from 'lucide-react'
import { toast } from 'sonner'

// ─── Palette ──────────────────────────────────────────────────────────────────
const NAVY   = '#0A1628'
const GOLD   = '#D4AF37'
const CYAN   = '#00D4FF'
const BG2    = '#0c1a34'
const BG3    = '#0c1528'
const BORDER = 'rgba(255,255,255,0.08)'
const CREAM  = '#F8F9FA'
const GRAY   = '#9ba8c4'
const MUTED  = '#4e5f82'
const GREEN  = '#22d98a'

// ─── Types ─────────────────────────────────────────────────────────────────────
type Periode = "Aujourd'hui" | 'Cette semaine' | 'Ce mois' | 'Cette année'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const CA_MOIS = [
  { mois: 'Jan', ca: 850000, commandes: 38 },
  { mois: 'Fév', ca: 920000, commandes: 42 },
  { mois: 'Mar', ca: 780000, commandes: 35 },
  { mois: 'Avr', ca: 1050000, commandes: 48 },
  { mois: 'Mai', ca: 1120000, commandes: 51 },
  { mois: 'Jun', ca: 980000, commandes: 44 },
  { mois: 'Jul', ca: 1200000, commandes: 55 },
  { mois: 'Aoû', ca: 1340000, commandes: 61 },
  { mois: 'Sep', ca: 1090000, commandes: 49 },
  { mois: 'Oct', ca: 1150000, commandes: 52 },
  { mois: 'Nov', ca: 1280000, commandes: 58 },
  { mois: 'Déc', ca: 1450000, commandes: 66 },
]

const TOP_PRODUITS = [
  { nom: 'Eau minérale 1,5 L',     qte: 240 },
  { nom: 'Savon de Marseille',     qte: 180 },
  { nom: 'Bière Brakina 65 cl',    qte: 145 },
  { nom: 'Jus Jaffa Orange',       qte: 120 },
  { nom: 'Cube Maggi boîte',       qte: 95 },
  { nom: 'Dentifrice Colgate',     qte: 88 },
  { nom: 'Riz local 50 kg',        qte: 85 },
  { nom: 'Huile de palme 5 L',     qte: 72 },
  { nom: 'Sucre granulé 10 kg',    qte: 68 },
  { nom: 'Farine de blé 25 kg',    qte: 54 },
]

const CATEGORIES_CA = [
  { name: 'Alimentation', value: 45, color: GOLD },
  { name: 'Boissons',     value: 25, color: CYAN },
  { name: 'Hygiène',      value: 15, color: GREEN },
  { name: 'Épicerie',     value: 10, color: '#f0a832' },
  { name: 'Électroménager', value: 5, color: '#a78bfa' },
]

const CLIENTS_EVOLUTION = [
  { mois: 'Mar', clients: 28 },
  { mois: 'Avr', clients: 32 },
  { mois: 'Mai', clients: 38 },
  { mois: 'Jun', clients: 35 },
  { mois: 'Jul', clients: 42 },
  { mois: 'Aoû', clients: 48 },
]

const TOP_CLIENTS = [
  { nom: 'Aminata Ouédraogo',  commandes: 8, total: 285000,  derniere: '2026-08-01' },
  { nom: 'Hamidou Zongo',      commandes: 6, total: 412000,  derniere: '2026-07-28' },
  { nom: 'Mariam Compaoré',    commandes: 7, total: 196000,  derniere: '2026-08-02' },
  { nom: 'Moussa Traoré',      commandes: 5, total: 248000,  derniere: '2026-07-30' },
  { nom: 'Fatoumata Diallo',   commandes: 9, total: 178000,  derniere: '2026-08-01' },
]

const KPI_DATA: Record<Periode, { ca: number; commandes: number; panier: number; produits: number; clients: number; benefice: number }> = {
  "Aujourd'hui":  { ca: 87500,    commandes: 4,   panier: 21875, produits: 23,   clients: 4,   benefice: 14200 },
  'Cette semaine':{ ca: 412000,   commandes: 18,  panier: 22888, produits: 142,  clients: 15,  benefice: 68500 },
  'Ce mois':      { ca: 1340000,  commandes: 61,  panier: 21967, produits: 485,  clients: 48,  benefice: 224000 },
  'Cette année':  { ca: 12220000, commandes: 599, panier: 20400, produits: 5240, clients: 284, benefice: 1980000 },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} F`

function pct(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value}%`
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, color, trend,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string; trend?: number
}) {
  return (
    <div style={{
      background: BG3, border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: MUTED, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
        <span style={{ background: `${color}18`, borderRadius: 8, padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </span>
      </div>
      <span style={{ color: CREAM, fontSize: '1.65rem', fontWeight: 800, lineHeight: 1 }}>{value}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: 18 }}>
        {sub && <span style={{ color: MUTED, fontSize: '0.72rem' }}>{sub}</span>}
        {trend !== undefined && (
          <span style={{ color: trend >= 0 ? GREEN : '#ef4444', fontSize: '0.72rem', fontWeight: 700 }}>
            {pct(trend)} vs mois préc.
          </span>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ color: CREAM, fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {children}
    </h3>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: BG3, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '1.25rem', ...style }}>
      {children}
    </div>
  )
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#070e1f', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
      <p style={{ margin: '0 0 0.4rem', color: GOLD, fontWeight: 700 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ margin: '0.15rem 0', color: p.color }}>
          {p.name} : <strong>{typeof p.value === 'number' && p.name.toLowerCase().includes('ca') ? fcfa(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function StatistiquesPage() {
  const [periode, setPeriode] = useState<Periode>("Aujourd'hui")

  const kpi = KPI_DATA[periode]
  const periodes: Periode[] = ["Aujourd'hui", 'Cette semaine', 'Ce mois', 'Cette année']

  const handleExport = () => {
    toast.success('Rapport exporté avec succès !', {
      description: `Statistiques — ${periode} — ${new Date().toLocaleDateString('fr-FR')}`,
    })
  }

  return (
    <div style={{ color: CREAM }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: GOLD, fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={22} color={GOLD} /> Statistiques
          </h2>
          <p style={{ color: MUTED, fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            Analytics de votre boutique — {periode}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Sélecteur période */}
          <div style={{ display: 'flex', background: BG3, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 4, gap: 4 }}>
            {periodes.map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                style={{
                  padding: '0.35rem 0.8rem', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: periode === p ? GOLD : 'transparent',
                  color: periode === p ? NAVY : GRAY,
                  whiteSpace: 'nowrap',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          {/* Export */}
          <button
            onClick={handleExport}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              background: 'rgba(212,175,55,0.12)', border: `1px solid rgba(212,175,55,0.3)`,
              color: GOLD, borderRadius: 9, padding: '0.5rem 1rem', fontWeight: 700,
              fontSize: '0.82rem', cursor: 'pointer',
            }}
          >
            <Download size={15} /> Exporter rapport
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard icon={TrendingUp}  label="CA Total"          value={fcfa(kpi.ca)}        sub="chiffre d'affaires" color={GOLD}  trend={12} />
        <KpiCard icon={ShoppingBag} label="Commandes"         value={String(kpi.commandes)} sub="passées"           color={CYAN}  trend={8} />
        <KpiCard icon={BarChart2}   label="Panier moyen"      value={fcfa(kpi.panier)}     sub="par commande"       color="#a78bfa" trend={-3} />
        <KpiCard icon={Package}     label="Produits vendus"   value={String(kpi.produits)} sub="unités totales"     color={GREEN}  trend={15} />
        <KpiCard icon={Users}       label="Clients uniques"   value={String(kpi.clients)}  sub="acheteurs actifs"   color="#f0a832" trend={6} />
        <KpiCard icon={Star}        label="Bénéfice estimé"   value={fcfa(kpi.benefice)}   sub="marge approximative" color={GREEN} trend={9} />
      </div>

      {/* ── ComposedChart CA + Commandes 12 mois ── */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <SectionTitle><BarChart2 size={18} color={CYAN} /> CA & Commandes — 12 mois</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={CA_MOIS} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
            <XAxis dataKey="mois" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="ca"       orientation="left"  tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="cmd"      orientation="right" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: '0.8rem' }}
              formatter={(value) => <span style={{ color: GRAY }}>{value}</span>}
            />
            <Bar yAxisId="ca"  dataKey="ca"        name="CA (FCFA)"  fill={GOLD}  radius={[4, 4, 0, 0]} opacity={0.85} />
            <Line yAxisId="cmd" dataKey="commandes" name="Commandes"  stroke={CYAN} strokeWidth={2.5} dot={{ fill: CYAN, r: 3 }} type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Ligne : Top produits + Pie catégories ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Top 10 produits */}
        <Card>
          <SectionTitle><Package size={17} color={GOLD} /> Top 10 produits vendus</SectionTitle>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={TOP_PRODUITS} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
              <XAxis type="number" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nom" tick={{ fill: GRAY, fontSize: 10 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip
                contentStyle={{ background: '#070e1f', border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: '0.8rem', color: CREAM }}
                formatter={(v: number) => [`${v} unités`, 'Vendus']}
              />
              <Bar dataKey="qte" name="Quantité" fill={GOLD} radius={[0, 4, 4, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* PieChart catégories */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle><TrendingUp size={17} color={CYAN} /> CA par catégorie</SectionTitle>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={CATEGORIES_CA} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value"
                >
                  {CATEGORIES_CA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#070e1f', border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: '0.8rem', color: CREAM }}
                  formatter={(v: number) => [`${v}%`, 'Part CA']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Légende */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', justifyContent: 'center' }}>
              {CATEGORIES_CA.map((c) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, display: 'inline-block' }} />
                  <span style={{ color: GRAY }}>{c.name}</span>
                  <span style={{ color: CREAM, fontWeight: 700 }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── LineChart clients uniques ── */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <SectionTitle><Users size={17} color={GREEN} /> Évolution clients uniques — 6 mois</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={CLIENTS_EVOLUTION} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
            <XAxis dataKey="mois" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#070e1f', border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: '0.8rem', color: CREAM }}
              formatter={(v: number) => [v, 'Clients uniques']}
            />
            <Line dataKey="clients" stroke={GREEN} strokeWidth={2.5} dot={{ fill: GREEN, r: 4, strokeWidth: 0 }} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Top 5 clients ── */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <SectionTitle><Users size={17} color={GOLD} /> Top 5 clients</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#07111f' }}>
                {['Rang', 'Client', 'Commandes', 'Total dépensé', 'Dernière commande'].map((h) => (
                  <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', color: MUTED, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_CLIENTS.map((c, i) => (
                <tr
                  key={c.nom}
                  style={{ borderTop: `1px solid ${BORDER}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#0d1a30')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '0.7rem 1rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 26, height: 26, borderRadius: '50%', fontWeight: 800, fontSize: '0.78rem',
                      background: i === 0 ? 'rgba(212,175,55,0.18)' : i === 1 ? 'rgba(156,163,175,0.15)' : i === 2 ? 'rgba(180,83,9,0.15)' : `${BORDER}`,
                      color: i === 0 ? GOLD : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : MUTED,
                    }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem 1rem', color: CREAM, fontWeight: 600 }}>{c.nom}</td>
                  <td style={{ padding: '0.7rem 1rem', color: CYAN, fontWeight: 700, textAlign: 'center' }}>{c.commandes}</td>
                  <td style={{ padding: '0.7rem 1rem', color: GREEN, fontWeight: 700, whiteSpace: 'nowrap' }}>{fcfa(c.total)}</td>
                  <td style={{ padding: '0.7rem 1rem', color: GRAY, fontSize: '0.8rem' }}>{c.derniere}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Insights ── */}
      <Card>
        <SectionTitle><Star size={17} color={GOLD} /> Insights boutique</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Heure de pointe', value: '10h – 12h',        icon: TrendingUp, color: CYAN,     sub: 'pics de vente journaliers' },
            { label: 'Jour le plus actif', value: 'Vendredi',       icon: BarChart2,  color: GOLD,     sub: 'plus de transactions' },
            { label: 'Produit star',     value: 'Eau minérale 1,5 L', icon: Package,   color: GREEN,    sub: '240 unités ce mois' },
            { label: 'Catégorie leader', value: 'Alimentation',    icon: Star,        color: '#f0a832', sub: '45% du CA total' },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div
              key={label}
              style={{
                background: BG2, border: `1px solid ${BORDER}`, borderRadius: 12,
                padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <Icon size={15} color={color} />
                <span style={{ color: MUTED, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
              </div>
              <span style={{ color, fontSize: '1.1rem', fontWeight: 800 }}>{value}</span>
              <span style={{ color: MUTED, fontSize: '0.72rem' }}>{sub}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
