'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { m as motion, AnimatePresence } from 'framer-motion'
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
  Smile,
  Meh,
  Frown,
} from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Client, Produit, Vente, VenteLigne, ModePaiement, Satisfaction } from '@/lib/types'
import { useLangue } from '@/components/LangueProvider'
import EmptyState from '@/components/EmptyState'
import { toast } from 'sonner'
import { appliquerVenteAuStock, creditAutorise, detecterDepassementStock, produitsEnAlerte } from '@/lib/calculs'
import { appliquerVenteAuClient } from '@/lib/credit'
import { clientRapideSchema } from '@/lib/sync/schemas'
import Recu from '@/components/Recu'
import BoutonTicketPDF from '@/components/TicketCaisse'

type Etape = 'panier' | 'paiement' | 'recu'

const MODES_CAISSE: ModePaiement[] = ['Espèces', 'Orange Money', 'Wave', 'Moov Money', 'Crédit']

const MODE_STYLE: Record<ModePaiement, { bg: string; color: string; border: string }> = {
  'Espèces': { bg: 'rgba(145,217,163,0.1)', color: '#91D9A3', border: '#91D9A3' },
  'Orange Money': { bg: 'rgba(255,138,61,0.14)', color: '#FF8A3D', border: '#FF8A3D' },
  'Wave': { bg: 'rgba(79,195,247,0.14)', color: '#4FC3F7', border: '#4FC3F7' },
  'Moov Money': { bg: 'rgba(199,146,234,0.14)', color: '#C792EA', border: '#C792EA' },
  'Crédit': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '#ef4444' },
}

const today = () => new Date().toISOString().slice(0, 10)

export default function Caisse() {
  const { t } = useLangue()
  const router = useRouter()
  const [produits, setProduits, loadedP] = usePersistedBoutique<Produit[]>('produits', [])
  const [, setVentes, loadedV] = usePersistedBoutique<Vente[]>('ventes', [])
  const [clients, setClients] = usePersistedBoutique<Client[]>('clients', [])
  const loaded = loadedP && loadedV

  const [etape, setEtape] = useState<Etape>('panier')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<VenteLigne[]>([])
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces')
  const [montantRecuStr, setMontantRecuStr] = useState('')
  const [clientSelectionneId, setClientSelectionneId] = useState<number | null>(null)
  const [venteFinale, setVenteFinale] = useState<Vente | null>(null)
  const [venteFinaleRendu, setVenteFinaleRendu] = useState<number | undefined>(undefined)
  const [venteFinaleMontantRecu, setVenteFinaleMontantRecu] = useState<number | undefined>(undefined)
  const [nouveauClientOuvert, setNouveauClientOuvert] = useState(false)
  const [nouveauNom, setNouveauNom] = useState('')
  const [nouveauTel, setNouveauTel] = useState('')
  const [nouveauErreur, setNouveauErreur] = useState<string | null>(null)

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
  const montantSaisi = montantRecuStr.trim() !== ''
  const montantRecu = montantSaisi ? Number(montantRecuStr) || 0 : total
  const renduMonnaie = montantRecu - total
  const creditSansClient = !creditAutorise(modePaiement, clientSelectionneId)
  const peutValider = (modePaiement !== 'Espèces' || montantRecu >= total) && !creditSansClient
  const depassements = detecterDepassementStock(cart, produits)

  const qtyDe = (produitId: number) => cart.find((l) => l.produitId === produitId)?.quantite ?? 0

  const changerQuantite = (p: Produit, delta: number) => {
    setCart((prev) => {
      const existe = prev.find((l) => l.produitId === p.id)
      if (!existe) {
        if (delta <= 0) return prev
        return [...prev, { produitId: p.id, nom: p.nom, quantite: 1, prixUnit: p.prixVente, prixAchat: p.prixAchat > 0 ? p.prixAchat : undefined }]
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

  const creerClientRapide = () => {
    const parse = clientRapideSchema.safeParse({ nom: nouveauNom, telephone: nouveauTel })
    if (!parse.success) {
      setNouveauErreur(parse.error.issues[0]?.message ?? 'Informations non valides')
      return
    }
    const client: Client = {
      id: Date.now(),
      nom: parse.data.nom,
      telephone: parse.data.telephone,
      ville: '',
      soldeDu: 0,
      totalAchats: 0,
      derniereVisite: today(),
    }
    setClients((prev) => [...prev, client])
    setClientSelectionneId(client.id)
    setNouveauClientOuvert(false)
    setNouveauNom('')
    setNouveauTel('')
    setNouveauErreur(null)
  }

  const valider = () => {
    if (!peutValider || cart.length === 0) return
    const clientChoisi = clients.find((c) => c.id === clientSelectionneId) ?? null
    const vente: Vente = {
      id: Date.now(),
      clientId: clientSelectionneId,
      client: clientChoisi?.nom ?? t.clientPassage,
      lignes: cart,
      total,
      modePaiement,
      statut: modePaiement === 'Crédit' ? 'Crédit' : 'Payé',
      date: today(),
    }
    setVentes((prev) => [vente, ...prev])
    const apres = appliquerVenteAuStock(produits, cart)
    setProduits(apres)
    const touches = apres.filter((p) => cart.some((l) => l.produitId === p.id))
    const { ruptures, faibles } = produitsEnAlerte(touches)
    ruptures.forEach((p) => toast.error(`${p.nom} : plus de stock !`, { duration: 6000 }))
    faibles.forEach((p) => toast.warning(`${p.nom} : il en reste ${p.stock}`, { duration: 5000 }))
    if (clientChoisi) {
      setClients((prev) => appliquerVenteAuClient(prev, clientChoisi.id, vente))
    }
    setVenteFinale(vente)
    setVenteFinaleMontantRecu(modePaiement === 'Espèces' && montantSaisi ? montantRecu : undefined)
    setVenteFinaleRendu(modePaiement === 'Espèces' && montantSaisi ? renduMonnaie : undefined)
    setEtape('recu')
  }

  const choisirSatisfaction = (s: Satisfaction) => {
    if (!venteFinale) return
    setVenteFinale({ ...venteFinale, satisfaction: s })
    setVentes((prev) => prev.map((v) => (v.id === venteFinale.id ? { ...v, satisfaction: s } : v)))
  }

  const nouvelleVente = () => {
    setCart([])
    setModePaiement('Espèces')
    setMontantRecuStr('')
    setClientSelectionneId(null)
    setNouveauClientOuvert(false)
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
          <h2 style={{ color: '#E3A00F', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{t.caisse}</h2>
          <p style={{ color: '#B7C5AE', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
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
                background: etapeIndex > i ? '#E3A00F' : '#496653',
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
            <Search size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#B7C5AE' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.rechercherProduit}
              style={{
                width: '100%',
                minHeight: 52,
                background: '#263F30',
                border: '1px solid #496653',
                borderRadius: 12,
                padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                color: '#F2EBCF',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {produitsFiltres.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#B7C5AE', padding: '3rem 1rem' }}>{t.aucunProduitCaisse}</p>
          ) : (
            <div className="sugu-caisse-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '6.5rem' }}>
              {produitsFiltres.map((p) => {
                const qty = qtyDe(p.id)
                const manque = qty > p.stock
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ajouter ${p.nom} au panier`}
                    onClick={() => changerQuantite(p, 1)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        changerQuantite(p, 1)
                      }
                    }}
                    style={{
                      background: qty > 0 ? 'rgba(227,160,15,0.08)' : '#263F30',
                      border: manque ? '2px solid #ef4444' : qty > 0 ? '2px solid #E3A00F' : '1px solid #496653',
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
                      <p style={{ color: '#F2EBCF', fontWeight: 700, fontSize: '1rem', margin: 0, lineHeight: 1.25 }}>{p.nom}</p>
                      <p style={{ color: '#E3A00F', fontWeight: 800, fontSize: '1.05rem', margin: '0.35rem 0 0' }}>
                        {p.prixVente.toLocaleString('fr-FR')} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#D9DEC9' }}>FCFA{p.unite ? ` / ${p.unite}` : ''}</span>
                      </p>
                      <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', fontWeight: 700, color: manque || p.stock === 0 ? '#ef4444' : p.stock < p.stockMin ? '#E3A00F' : '#D9DEC9' }}>
                        {manque ? `Seulement ${p.stock} en stock` : p.stock === 0 ? 'Plus de stock' : `Stock : ${p.stock}`}
                      </p>
                    </div>

                    {qty > 0 ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}
                      >
                        <button
                          onClick={() => changerQuantite(p, -1)}
                          aria-label={`Retirer un ${p.nom}`}
                          style={{
                            width: 48,
                            height: 48,
                            minHeight: 48,
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
                        <span style={{ color: '#F2EBCF', fontWeight: 800, fontSize: '1.15rem' }}>{qty}</span>
                        <button
                          onClick={() => changerQuantite(p, 1)}
                          aria-label={`Ajouter un ${p.nom}`}
                          style={{
                            width: 48,
                            height: 48,
                            minHeight: 48,
                            borderRadius: 10,
                            border: 'none',
                            background: '#E3A00F',
                            color: '#1F3A2B',
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
                          color: '#E3A00F',
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
              background: '#1F3A2B',
              borderTop: '1px solid #496653',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              zIndex: 80,
            }}
          >
            <div>
              {depassements.length > 0 && (
                <p role="alert" style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                  Stock insuffisant : {depassements.map((d) => d.nom).join(', ')}
                </p>
              )}
              <p style={{ color: '#B7C5AE', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>
                {nbArticles} {t.articles}
              </p>
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={total}
                  initial={{ scale: 1.15, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ color: '#E3A00F', fontWeight: 800, fontSize: '1.3rem', margin: '0.15rem 0 0' }}
                >
                  {total.toLocaleString('fr-FR')} FCFA
                </motion.p>
              </AnimatePresence>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={allerPaiement}
              disabled={cart.length === 0}
              className={cart.length > 0 ? 'sugu-gold-fab' : undefined}
              style={{
                minHeight: 56,
                minWidth: 160,
                background: cart.length > 0 ? undefined : '#B7C5AE',
                color: '#1F3A2B',
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
            </motion.button>
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
              color: '#D9DEC9',
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

          <div style={{ background: '#263F30', border: '1px solid #496653', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
            {cart.map((l) => (
              <div key={l.produitId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', padding: '0.5rem 0', borderBottom: '1px solid #496653' }}>
                <span style={{ color: '#D9DEC9' }}>
                  {l.nom} <span style={{ color: '#B7C5AE' }}>× {l.quantite}</span>
                </span>
                <span style={{ color: '#F2EBCF', fontWeight: 700 }}>{(l.quantite * l.prixUnit).toLocaleString('fr-FR')} FCFA</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.85rem', fontSize: '1.25rem' }}>
              <span style={{ color: '#D9DEC9', fontWeight: 700 }}>{t.total}</span>
              <span style={{ color: '#E3A00F', fontWeight: 900 }}>{total.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          {depassements.length > 0 && (
            <div role="alert" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <p style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.95rem', margin: '0 0 0.35rem' }}>Attention : pas assez de stock</p>
              {depassements.map((d) => (
                <p key={d.produitId} style={{ color: '#F2EBCF', fontSize: '0.9rem', margin: '0.15rem 0' }}>
                  {d.nom} : {d.demande} demandé{d.demande > 1 ? 's' : ''}, {d.disponible} en stock
                </p>
              ))}
              <p style={{ color: '#D9DEC9', fontSize: '0.82rem', margin: '0.5rem 0 0' }}>
                Si vous validez, le stock sera mis à 0. Vérifiez vos quantités.
              </p>
            </div>
          )}

          <p style={{ color: '#D9DEC9', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem' }}>{t.modePaiementLabel}</p>
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
                    border: selectionne ? `2px solid ${style.border}` : '1px solid #496653',
                    background: selectionne ? style.bg : '#263F30',
                    color: selectionne ? style.color : '#D9DEC9',
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

          {/* Associer un client */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#D9DEC9', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem' }}>
              {modePaiement === 'Crédit' ? 'Client (obligatoire pour un crédit)' : 'Client (optionnel)'}
            </label>
            <select
              value={clientSelectionneId ?? ''}
              onChange={(e) => setClientSelectionneId(e.target.value ? Number(e.target.value) : null)}
              style={{
                width: '100%',
                minHeight: 52,
                background: '#263F30',
                border: '1px solid #496653',
                borderRadius: 12,
                padding: '0.75rem 1rem',
                color: clientSelectionneId ? '#F2EBCF' : '#B7C5AE',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">— Client de passage —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}{c.telephone ? ` · ${c.telephone}` : ''}
                </option>
              ))}
            </select>
            {modePaiement === 'Crédit' && (
              <div style={{ marginTop: '0.75rem' }}>
                {!nouveauClientOuvert ? (
                  <button
                    type="button"
                    onClick={() => setNouveauClientOuvert(true)}
                    style={{ minHeight: 48, width: '100%', borderRadius: 12, border: '1px dashed #E3A00F', background: 'transparent', color: '#E3A00F', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Nouveau client
                  </button>
                ) : (
                  <div style={{ background: '#263F30', border: '1px solid #496653', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <input
                      value={nouveauNom}
                      onChange={(e) => setNouveauNom(e.target.value)}
                      placeholder="Nom du client"
                      aria-label="Nom du nouveau client"
                      style={{ minHeight: 52, background: '#1F3A2B', border: '1px solid #496653', borderRadius: 10, padding: '0.6rem 0.9rem', color: '#F2EBCF', fontSize: '1rem' }}
                    />
                    <input
                      value={nouveauTel}
                      onChange={(e) => setNouveauTel(e.target.value)}
                      inputMode="tel"
                      placeholder="Téléphone (facultatif)"
                      aria-label="Téléphone du nouveau client"
                      style={{ minHeight: 52, background: '#1F3A2B', border: '1px solid #496653', borderRadius: 10, padding: '0.6rem 0.9rem', color: '#F2EBCF', fontSize: '1rem' }}
                    />
                    {nouveauErreur && <p role="alert" style={{ color: '#ef4444', margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>{nouveauErreur}</p>}
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button type="button" onClick={() => setNouveauClientOuvert(false)} style={{ flex: 1, minHeight: 48, borderRadius: 10, border: '1px solid #496653', background: 'transparent', color: '#D9DEC9', fontWeight: 700, cursor: 'pointer' }}>
                        Annuler
                      </button>
                      <button type="button" onClick={creerClientRapide} style={{ flex: 1, minHeight: 48, borderRadius: 10, border: 'none', background: '#E3A00F', color: '#1F3A2B', fontWeight: 800, cursor: 'pointer' }}>
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}
                <p role={creditSansClient ? 'alert' : undefined} style={{ margin: '0.75rem 0 0', fontSize: '0.88rem', fontWeight: 600, color: creditSansClient ? '#E3A00F' : '#D9DEC9' }}>
                  {creditSansClient
                    ? 'Choisissez un client : sa dette sera notée sur sa fiche.'
                    : `Le client doit ${total.toLocaleString('fr-FR')} FCFA de plus. Vous l'encaisserez depuis sa fiche.`}
                </p>
              </div>
            )}
          </div>

          {modePaiement === 'Espèces' && (
            <div style={{ background: '#263F30', border: '1px solid #496653', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#D9DEC9', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {t.montantRecu} <span style={{ fontWeight: 500, color: '#D9DEC9' }}>(facultatif)</span>
              </label>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={montantRecuStr}
                onChange={(e) => setMontantRecuStr(e.target.value)}
                placeholder={String(total)}
                aria-label={`${t.montantRecu} (facultatif)`}
                style={{
                  width: '100%',
                  minHeight: 56,
                  background: '#1F3A2B',
                  border: '1px solid #496653',
                  borderRadius: 12,
                  padding: '0.75rem 1rem',
                  color: '#F2EBCF',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {montantSaisi ? (
                <p style={{ marginTop: '0.75rem', fontSize: '1.05rem', fontWeight: 800, color: renduMonnaie >= 0 ? '#91D9A3' : '#ef4444' }}>
                  {renduMonnaie >= 0
                    ? `${t.renduMonnaie}: ${renduMonnaie.toLocaleString('fr-FR')} FCFA`
                    : `Il manque ${Math.abs(renduMonnaie).toLocaleString('fr-FR')} FCFA`}
                </p>
              ) : (
                <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#D9DEC9' }}>
                  Laissez vide si le client donne le montant exact.
                </p>
              )}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={valider}
            disabled={!peutValider}
            style={{
              position: 'sticky',
              bottom: '1rem',
              zIndex: 10,
              boxShadow: '0 -10px 24px rgba(31,58,43,0.9)',
              width: '100%',
              minHeight: 60,
              background: peutValider ? '#91D9A3' : '#B7C5AE',
              color: '#1F3A2B',
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
            <CheckCircle2 size={22} /> {modePaiement === 'Crédit' ? 'Enregistrer à crédit' : t.validerPayer}
          </motion.button>
        </div>
      ) : (
        venteFinale && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            style={{ maxWidth: 480, margin: '0 auto' }}
          >
            <Recu vente={venteFinale} montantRecu={venteFinaleMontantRecu} rendu={venteFinaleRendu} />

            <div className="no-print" style={{ background: '#263F30', border: '1px solid #496653', borderRadius: 14, padding: '1.1rem', marginTop: '1.25rem', textAlign: 'center' }}>
              <p style={{ color: '#D9DEC9', fontSize: '0.88rem', fontWeight: 600, margin: '0 0 0.75rem' }}>{t.commentSestPasseeVente}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                {([
                  { s: 'bien' as Satisfaction, icon: Smile, label: t.satisfBien, color: '#91D9A3' },
                  { s: 'correct' as Satisfaction, icon: Meh, label: t.satisfCorrect, color: '#E3A00F' },
                  { s: 'probleme' as Satisfaction, icon: Frown, label: t.satisfProbleme, color: '#ef4444' },
                ]).map(({ s, icon: Icon, label, color }) => {
                  const selectionne = venteFinale.satisfaction === s
                  return (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => choisirSatisfaction(s)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.3rem',
                        minWidth: 76,
                        padding: '0.6rem 0.5rem',
                        borderRadius: 12,
                        border: selectionne ? `2px solid ${color}` : '1px solid #496653',
                        background: selectionne ? `${color}18` : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon size={24} color={color} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectionne ? color : '#D9DEC9' }}>{label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div className="no-print" style={{ marginTop: '1.25rem' }}>
              <BoutonTicketPDF vente={venteFinale} montantRecu={venteFinaleMontantRecu} rendu={venteFinaleRendu} />
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={imprimerPartager}
                style={{
                  flex: 1,
                  minHeight: 56,
                  background: '#263F30',
                  border: '1px solid #496653',
                  color: '#E3A00F',
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
                  background: '#E3A00F',
                  border: 'none',
                  color: '#1F3A2B',
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
          </motion.div>
        )
      )}

    </div>
  )
}
