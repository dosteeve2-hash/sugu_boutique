'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Printer,
  RotateCcw,
  CheckCircle2,
  Package,
} from 'lucide-react'
import { usePersisted } from '@/lib/storage'
import { Produit, Vente, VenteLigne, ModePaiement } from '@/lib/types'
import { useLangue } from '@/components/LangueProvider'
import EmptyState from '@/components/EmptyState'
import Recu from '@/components/Recu'

type Etape = 'panier' | 'paiement' | 'recu'

const MODES_CAISSE: ModePaiement[] = ['Espèces', 'Orange Money', 'Wave', 'Moov Money']

const MODE_STYLE: Record<ModePaiement, { bg: string; color: string; border: string }> = {
  'Espèces': { bg: 'rgba(34,217,138,0.1)', color: '#22d98a', border: '#22d98a' },
  'Orange Money': { bg: 'rgba(240,168,50,0.12)', color: '#f0a832', border: '#f0a832' },
  'Wave': { bg: 'rgba(0,188,212,0.12)', color: '#00BCD4', border: '#00BCD4' },
  'Moov Money': { bg: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '#D4AF37' },
  'Crédit': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '#ef4444' },
}

const today = () => new Date().toISOString().slice(0, 10)

export default function Caisse() {
  const { t } = useLangue()
  const router = useRouter()
  const [produits, setProduits, loadedP] = usePersisted<Produit[]>('sugu_produits', [])
  const [, setVentes, loadedV] = usePersisted<Vente[]>('sugu_ventes', [])
  const loaded = loadedP && loadedV

  const [etape, setEtape] = useState<Etape>('panier')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<VenteLigne[]>([])
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces')
  const [montantRecuStr, setMontantRecuStr] = useState('')
  const [venteFinale, setVenteFinale] = useState<Vente | null>(null)
  const [venteFinaleRendu, setVenteFinaleRendu] = useState<number | undefined>(undefined)
  const [venteFinaleMontantRecu, setVenteFinaleMontantRecu] = useState<number | undefined>(undefined)

  const produitsFiltres = useMemo(
    () =>
      produits.filter(
        (p) =>
          p.nom.toLowerCase().includes(search.toLowerCase()) ||
          p.categorie.toLowerCase().includes(search.toLowerCase())
      ),
    [produits, search]
  )

  const total = cart.reduce((a, l) => a + l.quantite * l.prixUnit, 0)
  const nbArticles = cart.reduce((a, l) => a + l.quantite, 0)
  const montantRecu = Number(montantRecuStr) || 0
  const renduMonnaie = montantRecu - total
  const peutValider = modePaiement !== 'Espèces' || montantRecu >= total

  const qtyDe = (produitId: number) => cart.find((l) => l.produitId === produitId)?.quantite ?? 0

  const changerQuantite = (p: Produit, delta: number) => {
    setCart((prev) => {
      const existe = prev.find((l) => l.produitId === p.id)
      if (!existe) {
        if (delta <= 0) return prev
        return [...prev, { produitId: p.id, nom: p.nom, quantite: 1, prixUnit: p.prixVente }]
      }
      const nouvelleQte = existe.quantite + delta
      if (nouvelleQte <= 0) return prev.filter((l) => l.produitId !== p.id)
      return prev.map((l) => (l.produitId === p.id ? { ...l, quantite: nouvelleQte } : l))
    })
  }

  const allerPaiement = () => {
    if (cart.length === 0) return
    setModePaiement('Espèces')
    setMontantRecuStr('')
    setEtape('paiement')
  }

  const valider = () => {
    if (!peutValider || cart.length === 0) return
    const vente: Vente = {
      id: Date.now(),
      clientId: null,
      client: t.clientPassage,
      lignes: cart,
      total,
      modePaiement,
      statut: 'Payé',
      date: today(),
    }
    setVentes((prev) => [vente, ...prev])
    setProduits((prev) =>
      prev.map((p) => {
        const ligne = cart.find((l) => l.produitId === p.id)
        return ligne ? { ...p, stock: Math.max(0, p.stock - ligne.quantite) } : p
      })
    )
    setVenteFinale(vente)
    setVenteFinaleMontantRecu(modePaiement === 'Espèces' ? montantRecu : undefined)
    setVenteFinaleRendu(modePaiement === 'Espèces' ? renduMonnaie : undefined)
    setEtape('recu')
  }

  const nouvelleVente = () => {
    setCart([])
    setModePaiement('Espèces')
    setMontantRecuStr('')
    setVenteFinale(null)
    setSearch('')
    setEtape('panier')
  }

  const imprimerPartager = async () => {
    if (navigator.share && venteFinale) {
      try {
        const lignesTxt = venteFinale.lignes.map((l) => `${l.nom} x${l.quantite} = ${l.quantite * l.prixUnit} FCFA`).join('\n')
        await navigator.share({
          title: 'SUGU — Reçu',
          text: `SUGU\n${lignesTxt}\n${t.total}: ${venteFinale.total.toLocaleString('fr-FR')} FCFA\n${t.modePaiementLabel}: ${venteFinale.modePaiement}`,
        })
        return
      } catch {
        // partage annulé — on retombe sur l'impression
      }
    }
    window.print()
  }

  if (!loaded) return null

  const etapeIndex = etape === 'panier' ? 1 : etape === 'paiement' ? 2 : 3

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{t.caisse}</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            {t.etape} {etapeIndex}/3 — {etape === 'panier' ? t.panier : etape === 'paiement' ? t.paiement : t.recu}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['panier', 'paiement', 'recu'] as Etape[]).map((e, i) => (
            <span
              key={e}
              style={{
                width: 12,
                height: 12,
                borderRadius: 99,
                background: etapeIndex > i ? '#D4AF37' : '#16233d',
              }}
            />
          ))}
        </div>
      </div>

      {produits.length === 0 ? (
        <EmptyState icon={Package} title={t.aucunDonnee} message={t.ajouterProduitsAbord} actionLabel={t.ajouterProduit} onAction={() => router.push('/produits')} />
      ) : etape === 'panier' ? (
        <>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#4e5f82' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.rechercherProduit}
              style={{
                width: '100%',
                minHeight: 52,
                background: '#0c1528',
                border: '1px solid #16233d',
                borderRadius: 12,
                padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                color: '#f5f0e8',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {produitsFiltres.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#4e5f82', padding: '3rem 1rem' }}>{t.aucunProduitCaisse}</p>
          ) : (
            <div className="sugu-caisse-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '6.5rem' }}>
              {produitsFiltres.map((p) => {
                const qty = qtyDe(p.id)
                return (
                  <div
                    key={p.id}
                    onClick={() => changerQuantite(p, 1)}
                    style={{
                      background: qty > 0 ? 'rgba(212,175,55,0.08)' : '#0c1528',
                      border: qty > 0 ? '2px solid #D4AF37' : '1px solid #16233d',
                      borderRadius: 14,
                      padding: '1rem 0.85rem',
                      cursor: 'pointer',
                      minHeight: 132,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      userSelect: 'none',
                    }}
                  >
                    <div>
                      <p style={{ color: '#f5f0e8', fontWeight: 700, fontSize: '1rem', margin: 0, lineHeight: 1.25 }}>{p.nom}</p>
                      <p style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.05rem', margin: '0.35rem 0 0' }}>
                        {p.prixVente.toLocaleString('fr-FR')} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ba8c4' }}>FCFA{p.unite ? ` / ${p.unite}` : ''}</span>
                      </p>
                    </div>

                    {qty > 0 ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}
                      >
                        <button
                          onClick={() => changerQuantite(p, -1)}
                          aria-label="-"
                          style={{
                            width: 40,
                            height: 40,
                            minHeight: 40,
                            borderRadius: 10,
                            border: 'none',
                            background: 'rgba(239,68,68,0.15)',
                            color: '#ef4444',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Minus size={18} />
                        </button>
                        <span style={{ color: '#F8F9FA', fontWeight: 800, fontSize: '1.15rem' }}>{qty}</span>
                        <button
                          onClick={() => changerQuantite(p, 1)}
                          aria-label="+"
                          style={{
                            width: 40,
                            height: 40,
                            minHeight: 40,
                            borderRadius: 10,
                            border: 'none',
                            background: '#D4AF37',
                            color: '#0A1628',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#00BCD4',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        <Plus size={16} /> {t.ajouter}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div
            className="no-print"
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              background: '#070e1f',
              borderTop: '1px solid #16233d',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              zIndex: 80,
            }}
          >
            <div>
              <p style={{ color: '#4e5f82', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>
                {nbArticles} {t.articles}
              </p>
              <p style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.3rem', margin: '0.15rem 0 0' }}>
                {total.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <button
              onClick={allerPaiement}
              disabled={cart.length === 0}
              style={{
                minHeight: 56,
                minWidth: 160,
                background: cart.length > 0 ? '#D4AF37' : '#4e5f82',
                color: '#0A1628',
                border: 'none',
                borderRadius: 12,
                padding: '0 1.5rem',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {t.suivant} <ShoppingCart size={20} />
            </button>
          </div>
        </>
      ) : etape === 'paiement' ? (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <button
            onClick={() => setEtape('panier')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: '#9ba8c4',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem 0',
              marginBottom: '1rem',
              minHeight: 44,
            }}
          >
            <ArrowLeft size={18} /> {t.retour}
          </button>

          <div style={{ background: '#0c1528', border: '1px solid #16233d', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
            {cart.map((l) => (
              <div key={l.produitId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '0.5rem 0', borderBottom: '1px solid #16233d' }}>
                <span style={{ color: '#9ba8c4' }}>
                  {l.nom} <span style={{ color: '#4e5f82' }}>× {l.quantite}</span>
                </span>
                <span style={{ color: '#f5f0e8', fontWeight: 700 }}>{(l.quantite * l.prixUnit).toLocaleString('fr-FR')} FCFA</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.85rem', fontSize: '1.25rem' }}>
              <span style={{ color: '#9ba8c4', fontWeight: 700 }}>{t.total}</span>
              <span style={{ color: '#D4AF37', fontWeight: 900 }}>{total.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <p style={{ color: '#9ba8c4', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem' }}>{t.modePaiementLabel}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {MODES_CAISSE.map((m) => {
              const selectionne = modePaiement === m
              const style = MODE_STYLE[m]
              return (
                <button
                  key={m}
                  onClick={() => setModePaiement(m)}
                  style={{
                    minHeight: 56,
                    borderRadius: 12,
                    border: selectionne ? `2px solid ${style.border}` : '1px solid #16233d',
                    background: selectionne ? style.bg : '#0c1528',
                    color: selectionne ? style.color : '#9ba8c4',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  {m === 'Espèces' ? t.especes : m}
                </button>
              )
            })}
          </div>

          {modePaiement === 'Espèces' && (
            <div style={{ background: '#0c1528', border: '1px solid #16233d', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#9ba8c4', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {t.montantRecu}
              </label>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={montantRecuStr}
                onChange={(e) => setMontantRecuStr(e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  minHeight: 56,
                  background: '#070e1f',
                  border: '1px solid #16233d',
                  borderRadius: 12,
                  padding: '0.75rem 1rem',
                  color: '#f5f0e8',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {montantRecuStr !== '' && (
                <p style={{ marginTop: '0.75rem', fontSize: '1.05rem', fontWeight: 800, color: renduMonnaie >= 0 ? '#22d98a' : '#ef4444' }}>
                  {t.renduMonnaie}: {renduMonnaie.toLocaleString('fr-FR')} FCFA
                </p>
              )}
            </div>
          )}

          <button
            onClick={valider}
            disabled={!peutValider}
            style={{
              width: '100%',
              minHeight: 60,
              background: peutValider ? '#22d98a' : '#4e5f82',
              color: '#0A1628',
              border: 'none',
              borderRadius: 14,
              fontWeight: 900,
              fontSize: '1.1rem',
              cursor: peutValider ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
            }}
          >
            <CheckCircle2 size={22} /> {t.validerPayer}
          </button>
        </div>
      ) : (
        venteFinale && (
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <Recu vente={venteFinale} montantRecu={venteFinaleMontantRecu} rendu={venteFinaleRendu} />
            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={imprimerPartager}
                style={{
                  flex: 1,
                  minHeight: 56,
                  background: '#0c1528',
                  border: '1px solid #16233d',
                  color: '#00BCD4',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Printer size={18} /> {t.imprimerPartager}
              </button>
              <button
                onClick={nouvelleVente}
                style={{
                  flex: 1,
                  minHeight: 56,
                  background: '#D4AF37',
                  border: 'none',
                  color: '#0A1628',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <RotateCcw size={18} /> {t.nouvelleVente}
              </button>
            </div>
          </div>
        )
      )}

    </div>
  )
}
