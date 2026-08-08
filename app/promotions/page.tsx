'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { Tag, Plus, Search, Eye, X, CheckCircle, Clock, AlertCircle, Percent, Gift, Package } from 'lucide-react'

/* ── Types ───────────────────────────────────────────────────────────────── */
type StatutPromo = 'Active' | 'A venir' | 'Expiree'
type TypePromo   = 'Remise %' | 'Remise fixe' | 'Pack prix' | 'BOGO' | 'Seuil achat'

interface Promo {
  id: string
  nom: string
  type: TypePromo
  valeur: number
  statut: StatutPromo
  debut: string
  fin: string
  applicable: string
  codePromo?: string
  utilisations: number
  caTotalPromo: number
  economieClients: number
  description?: string
}

/* ── Mock data ───────────────────────────────────────────────────────────── */
const PROMOS: Promo[] = [
  {
    id:'P01', nom:'Rentree scolaire 2026', type:'Remise %', valeur:15,
    statut:'Active', debut:'2026-08-01', fin:'2026-09-15',
    applicable:'Fournitures scolaires, sacs, cartables',
    codePromo:'RENTREE26', utilisations:84, caTotalPromo:1_260_000, economieClients:222_000,
    description:'Promotion pour la rentree des classes. Valable sur tous les articles scolaires.',
  },
  {
    id:'P02', nom:'Fete du Mouton — Offre speciale', type:'Pack prix', valeur:0,
    statut:'Expiree', debut:'2026-06-01', fin:'2026-06-17',
    applicable:'Vetements traditionnels, boubous, djellabas',
    utilisations:156, caTotalPromo:3_120_000, economieClients:468_000,
    description:'Pack 3 boubous achetes = prix de 2 + cadeau surprise.',
  },
  {
    id:'P03', nom:'Soldes ete aout', type:'Remise %', valeur:20,
    statut:'Active', debut:'2026-08-05', fin:'2026-08-31',
    applicable:'Toute la collection vetements ete',
    codePromo:'ETE20', utilisations:42, caTotalPromo:840_000, economieClients:210_000,
  },
  {
    id:'P04', nom:'Fidele client — reduction permanente', type:'Remise fixe', valeur:2_500,
    statut:'Active', debut:'2026-01-01', fin:'2026-12-31',
    applicable:'Tout achat superieur a 25 000 FCFA (clients fideles)',
    codePromo:'FIDE25', utilisations:211, caTotalPromo:5_275_000, economieClients:527_500,
  },
  {
    id:'P05', nom:'Black Friday Preview', type:'Remise %', valeur:30,
    statut:'A venir', debut:'2026-11-25', fin:'2026-11-30',
    applicable:'Electronique, electromenager, telephones',
    codePromo:'BF30', utilisations:0, caTotalPromo:0, economieClients:0,
    description:'Offre flash 6 jours uniquement — communication prevue le 20 nov.',
  },
  {
    id:'P06', nom:'BOGO Alimentation — 1 achete 1 offert', type:'BOGO', valeur:50,
    statut:'Active', debut:'2026-08-08', fin:'2026-08-22',
    applicable:'Huile, riz, sucre, farine',
    codePromo:'BOGO08', utilisations:29, caTotalPromo:580_000, economieClients:290_000,
    description:'Valable les samedis uniquement. Stock limite.',
  },
  {
    id:'P07', nom:'Seuil 50k — remise 5k', type:'Seuil achat', valeur:5_000,
    statut:'Active', debut:'2026-07-01', fin:'2026-08-31',
    applicable:'Tout achat a partir de 50 000 FCFA',
    utilisations:38, caTotalPromo:2_660_000, economieClients:190_000,
  },
  {
    id:'P08', nom:'Noel 2026', type:'Remise %', valeur:25,
    statut:'A venir', debut:'2026-12-20', fin:'2026-12-31',
    applicable:'Jouets, cadeaux, decoration',
    codePromo:'NOEL25', utilisations:0, caTotalPromo:0, economieClients:0,
  },
]

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function statutColor(s: StatutPromo) {
  if (s === 'Active')  return '#22c55e'
  if (s === 'A venir') return '#00D4FF'
  return '#6b7280'
}
function typeIcon(t: TypePromo) {
  if (t === 'BOGO' || t === 'Pack prix') return <Gift size={12} />
  if (t === 'Seuil achat')               return <Package size={12} />
  return <Percent size={12} />
}
const TYPE_COLORS: Record<TypePromo, string> = {
  'Remise %':    '#D4AF37',
  'Remise fixe': '#00D4FF',
  'Pack prix':   '#a78bfa',
  'BOGO':        '#f97316',
  'Seuil achat': '#22c55e',
}

function StatutBadge({ s }: { s: StatutPromo }) {
  const c = statutColor(s)
  const icons: Record<StatutPromo, React.ReactNode> = {
    'Active':   <CheckCircle size={11} />,
    'A venir':  <Clock size={11} />,
    'Expiree':  <AlertCircle size={11} />,
  }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      background:`${c}18`, color:c, borderRadius:6, padding:'3px 10px',
      fontSize:11, fontWeight:700, whiteSpace:'nowrap' as const }}>
      {icons[s]} {s}
    </span>
  )
}

function KpiCard({ label, value, sub, color, icon: Icon }:
  { label:string; value:string|number; sub?:string; color:string; icon:React.ComponentType<{size?:number;color?:string}> }) {
  return (
    <div style={{ background:'#0c1528', border:'1px solid #16233d', borderRadius:12, padding:'16px 20px',
      display:'flex', flexDirection:'column' as const, gap:6 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:12, color:'#4e5f82' }}>{label}</span>
        <div style={{ background:`${color}18`, borderRadius:8, padding:7, display:'flex' }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div style={{ fontSize:24, fontWeight:700, color:'#f5f0e8', fontFamily:'monospace' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'#4e5f82' }}>{sub}</div>}
    </div>
  )
}

function ModalPromo({ p, onClose }: { p: Promo; onClose: () => void }) {
  const color = TYPE_COLORS[p.type]
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <div style={{ position:'relative', background:'#0c1528', border:'1px solid #16233d',
        borderRadius:18, padding:28, width:'100%', maxWidth:520, maxHeight:'90vh',
        overflowY:'auto' as const, margin:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#f5f0e8', marginBottom:6 }}>{p.nom}</div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' as const }}>
              <StatutBadge s={p.statut} />
              <span style={{ fontSize:12, color:'#4e5f82' }}>{p.debut} → {p.fin}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#4e5f82', cursor:'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ background:`${color}10`, border:`1px solid ${color}25`,
          borderRadius:12, padding:'14px 18px', textAlign:'center' as const, marginBottom:16 }}>
          <div style={{ fontSize:12, color:'#4e5f82', marginBottom:4 }}>Offre</div>
          <div style={{ fontSize:22, fontWeight:800, color, fontFamily:'monospace' }}>
            {p.type === 'Remise %' || p.type === 'BOGO'
              ? `-${p.valeur}%`
              : p.type === 'Remise fixe' || p.type === 'Seuil achat'
              ? `-${p.valeur.toLocaleString('fr-FR')} FCFA`
              : 'Pack special'}
          </div>
          <div style={{ fontSize:12, color:'#4e5f82', marginTop:4 }}>{p.type}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {([
            ['Applicable', p.applicable],
            ['Code promo', p.codePromo ?? 'Aucun'],
            ['Utilisations', String(p.utilisations)],
            ['CA sous promo', `${(p.caTotalPromo/1_000).toFixed(0)}k FCFA`],
            ['Remises clients', `${(p.economieClients/1_000).toFixed(0)}k FCFA`],
            ['Validite', `${p.debut} → ${p.fin}`],
          ] as [string,string][]).map(([k,v],i) => (
            <div key={i} style={{ background:'#0a1122', borderRadius:10, padding:'10px 14px',
              ...(i===0?{gridColumn:'1 / -1'}:{}) }}>
              <div style={{ fontSize:10, color:'#4e5f82', textTransform:'uppercase' as const,
                letterSpacing:'0.05em', marginBottom:3 }}>{k}</div>
              <div style={{ fontSize:13, color:'#f5f0e8', fontWeight:500 }}>{v}</div>
            </div>
          ))}
        </div>
        {p.description && (
          <div style={{ background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.15)',
            borderRadius:10, padding:'10px 14px', marginBottom:16 }}>
            <div style={{ fontSize:11, color:'#00D4FF', fontWeight:600, marginBottom:4 }}>Description</div>
            <div style={{ fontSize:12, color:'#9ba8c4' }}>{p.description}</div>
          </div>
        )}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          {p.statut === 'Active' && (
            <button onClick={() => { toast.success(`Promotion desactivee`); onClose() }}
              style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444',
                border:'1px solid rgba(239,68,68,0.25)', borderRadius:8,
                padding:'8px 14px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
              Desactiver
            </button>
          )}
          <button onClick={onClose}
            style={{ background:'#0a1122', border:'1px solid #16233d',
              color:'#9ba8c4', borderRadius:8, padding:'8px 14px', fontSize:12, cursor:'pointer' }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Chart data ─────────────────────────────────────────────────────────── */
const chartData = PROMOS.filter(p => p.caTotalPromo > 0).map(p => ({
  nom: p.nom.length > 18 ? p.nom.slice(0,16) + '…' : p.nom,
  ca: p.caTotalPromo,
  eco: p.economieClients,
}))

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function PromotionsPage() {
  const [search,       setSearch]       = useState('')
  const [filterStatut, setFilterStatut] = useState('Tous')
  const [filterType,   setFilterType]   = useState('Tous')
  const [selected,     setSelected]     = useState<Promo | null>(null)

  const TYPES: TypePromo[] = ['Remise %','Remise fixe','Pack prix','BOGO','Seuil achat']

  const filtered = useMemo(() =>
    PROMOS.filter(p =>
      (filterStatut === 'Tous' || p.statut === filterStatut) &&
      (filterType === 'Tous' || p.type === filterType) &&
      (!search || p.nom.toLowerCase().includes(search.toLowerCase()) ||
                  (p.codePromo ?? '').toLowerCase().includes(search.toLowerCase()))
    ),[filterStatut, filterType, search])

  const actives  = PROMOS.filter(p => p.statut === 'Active').length
  const totalCA  = PROMOS.reduce((s, p) => s + p.caTotalPromo, 0)
  const totalEco = PROMOS.reduce((s, p) => s + p.economieClients, 0)
  const totalUti = PROMOS.reduce((s, p) => s + p.utilisations, 0)

  const th: React.CSSProperties = {
    padding:'10px 16px', textAlign:'left', fontSize:11, color:'#4e5f82',
    fontWeight:600, borderBottom:'1px solid #16233d',
    background:'#0a1122', whiteSpace:'nowrap' as const,
  }
  const td: React.CSSProperties = {
    padding:'12px 16px', fontSize:13, color:'#f5f0e8',
    borderBottom:'1px solid #16233d', verticalAlign:'middle',
  }
  const fBtn = (a: boolean): React.CSSProperties => ({
    background:a ? 'rgba(212,175,55,0.15)' : 'transparent',
    color:a ? '#D4AF37' : '#4e5f82',
    border:`1px solid ${a ? 'rgba(212,175,55,0.4)' : '#16233d'}`,
    borderRadius:7, padding:'4px 11px', fontSize:11, cursor:'pointer', fontWeight:a?700:400,
  })

  return (
    <div style={{ display:'flex', flexDirection:'column' as const, gap:24, maxWidth:1200 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#f5f0e8', margin:0 }}>Promotions & Remises</h1>
          <p style={{ fontSize:13, color:'#4e5f82', margin:'4px 0 0' }}>{PROMOS.length} promotions · SUGU</p>
        </div>
        <button onClick={() => toast.success('Nouvelle promotion — bientot disponible')}
          style={{ display:'flex', alignItems:'center', gap:7, background:'#D4AF37', color:'#0A1628',
            border:'none', borderRadius:10, padding:'10px 16px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          <Plus size={14} /> Creer
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <KpiCard label='Actives'           value={actives}                               sub='en cours'        color='#22c55e' icon={Tag}         />
        <KpiCard label='CA total promo'    value={`${(totalCA/1_000_000).toFixed(2)}M`}  sub='FCFA cumul'      color='#D4AF37' icon={Percent}      />
        <KpiCard label='Remises accordees' value={`${(totalEco/1_000).toFixed(0)}k`}     sub='FCFA aux clients' color='#00D4FF' icon={Gift}         />
        <KpiCard label='Utilisations'      value={totalUti}                              sub='total toutes promos' color='#a78bfa' icon={CheckCircle} />
      </div>

      {/* Chart */}
      <div style={{ background:'#0c1528', border:'1px solid #16233d', borderRadius:14, padding:24 }}>
        <h3 style={{ fontSize:13, fontWeight:600, color:'#f5f0e8', margin:'0 0 16px' }}>CA vs Remises par promotion</h3>
        <ResponsiveContainer width='100%' height={175}>
          <BarChart data={chartData} barGap={3} barSize={13} margin={{ top:0, right:0, bottom:0, left:-10 }}>
            <XAxis dataKey='nom' tick={{ fontSize:10, fill:'#4e5f82' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:'#4e5f82' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${((v as number)/1_000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background:'#0c1528', border:'1px solid #16233d', borderRadius:8, fontSize:12 }}
              cursor={{ fill:'rgba(255,255,255,0.03)' }}
              formatter={(v, n) => [`${(v as number).toLocaleString('fr-FR')} FCFA`, n==='ca'?'CA promo':'Remises']} />
            <Bar dataKey='ca'  name='ca'  fill='#D4AF37' radius={[4,4,0,0]} />
            <Bar dataKey='eco' name='eco' fill='rgba(0,212,255,0.55)' radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', flexDirection:'column' as const, gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#0c1528',
          border:'1px solid #16233d', borderRadius:10, padding:'8px 14px', maxWidth:360 }}>
          <Search size={14} color='#4e5f82' />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder='Nom ou code promo...'
            style={{ background:'none', border:'none', outline:'none', color:'#f5f0e8', fontSize:13, width:'100%' }} />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const }}>
          {['Tous','Active','A venir','Expiree'].map(s => (
            <button key={s} onClick={() => setFilterStatut(s)} style={fBtn(filterStatut === s)}>{s}</button>
          ))}
          <span style={{ color:'#16233d', margin:'0 6px' }}>|</span>
          {(['Tous', ...TYPES]).map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={fBtn(filterType === t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#0c1528', border:'1px solid #16233d', borderRadius:14, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Promotion','Type','Valeur','Periode','Code','Utilise','CA promo','Statut',''].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ ...td, textAlign:'center', color:'#4e5f82', padding:48, border:'none' }}>
                  Aucune promotion
                </td></tr>
              )}
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ background:i%2===1?'rgba(10,17,34,0.6)':'transparent' }}>
                  <td style={td}>
                    <div style={{ fontWeight:600, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{p.nom}</div>
                    <div style={{ fontSize:11, color:'#4e5f82' }}>{p.applicable.slice(0,35)}{p.applicable.length>35?'…':''}</div>
                  </td>
                  <td style={td}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                      background:`${TYPE_COLORS[p.type]}15`, color:TYPE_COLORS[p.type],
                      borderRadius:5, padding:'2px 8px', fontSize:11, fontWeight:600 }}>
                      {typeIcon(p.type)} {p.type}
                    </span>
                  </td>
                  <td style={{ ...td, fontFamily:'monospace', fontWeight:700, color:'#D4AF37' }}>
                    {p.type==='Remise %'||p.type==='BOGO' ? `-${p.valeur}%`
                    : p.type==='Seuil achat'||p.type==='Remise fixe' ? `-${p.valeur.toLocaleString('fr-FR')} F`
                    : 'Pack'}
                  </td>
                  <td style={{ ...td, fontSize:11, color:'#4e5f82' }}>{p.debut} → {p.fin}</td>
                  <td style={td}>
                    {p.codePromo
                      ? <code style={{ background:'rgba(0,212,255,0.08)', color:'#00D4FF', borderRadius:4, padding:'2px 7px', fontSize:11 }}>{p.codePromo}</code>
                      : <span style={{ color:'#4e5f82', fontSize:11 }}>—</span>}
                  </td>
                  <td style={{ ...td, fontFamily:'monospace', color:'#9ba8c4' }}>{p.utilisations}</td>
                  <td style={{ ...td, fontFamily:'monospace', color:'#D4AF37', fontWeight:700 }}>
                    {p.caTotalPromo ? `${(p.caTotalPromo/1_000).toFixed(0)}k` : '—'}
                  </td>
                  <td style={td}><StatutBadge s={p.statut} /></td>
                  <td style={td}>
                    <button onClick={() => setSelected(p)}
                      style={{ display:'inline-flex', alignItems:'center', gap:5,
                        background:'rgba(0,188,212,0.1)', border:'none', color:'#00BCD4',
                        borderRadius:7, padding:'5px 11px', fontSize:11, cursor:'pointer', fontWeight:600 }}>
                      <Eye size={12}/> Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'10px 18px', borderTop:'1px solid #16233d', fontSize:11, color:'#4e5f82',
          display:'flex', justifyContent:'space-between' }}>
          <span>{filtered.length} promotion{filtered.length!==1?'s':''}</span>
          <span style={{ color:'#D4AF37', fontWeight:600 }}>
            {actives} active{actives!==1?'s':''} · {totalEco.toLocaleString('fr-FR')} FCFA remises total
          </span>
        </div>
      </div>

      {selected && <ModalPromo p={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
