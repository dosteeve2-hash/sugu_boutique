'use client'

import { FileDown } from 'lucide-react'
import { Vente } from '@/lib/types'

interface Props {
  vente: Vente
  montantRecu?: number
  rendu?: number
}

export default function BoutonTicketPDF({ vente, montantRecu, rendu }: Props) {
  const genererPDF = async () => {
    const { default: JsPDF } = await import('jspdf')

    const W = 80
    let y = 8
    const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: [W, 260] })

    // ── Header navy ────────────────────────────────────────────
    doc.setFillColor(10, 22, 40)
    doc.rect(0, 0, W, 22, 'F')

    doc.setTextColor(212, 175, 55)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('SUGU', W / 2, 11, { align: 'center' })

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(155, 168, 196)
    doc.text('Votre boutique partout, tout le temps', W / 2, 17, { align: 'center' })

    y = 27
    doc.setTextColor(10, 22, 40)

    const dateHeure = new Date(vente.id).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(dateHeure, W / 2, y, { align: 'center' })
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.text(`Reçu N° ${vente.id.toString().slice(-6)}`, W / 2, y, { align: 'center' })
    y += 5

    // ── Séparateur ─────────────────────────────────────────────
    const sep = () => {
      doc.setDrawColor(180, 180, 180)
      doc.setLineWidth(0.2)
      doc.line(6, y, W - 6, y)
      y += 5
    }
    sep()

    // ── Articles ───────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(10, 22, 40)
    doc.text('ARTICLES', 6, y)
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    vente.lignes.forEach((l) => {
      const sous = `${(l.quantite * l.prixUnit).toLocaleString('fr-FR')} FCFA`
      const nomTronq = l.nom.length > 18 ? l.nom.slice(0, 16) + '..' : l.nom
      doc.setTextColor(50, 50, 50)
      doc.text(`${nomTronq} ×${l.quantite}`, 6, y)
      doc.setTextColor(10, 22, 40)
      doc.text(sous, W - 6, y, { align: 'right' })
      y += 6
    })

    y += 1
    sep()

    // ── Total ──────────────────────────────────────────────────
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(10, 22, 40)
    doc.text('TOTAL', 6, y)
    doc.setTextColor(212, 175, 55)
    doc.text(`${vente.total.toLocaleString('fr-FR')} FCFA`, W - 6, y, { align: 'right' })
    y += 8

    // ── Paiement ───────────────────────────────────────────────
    doc.setTextColor(10, 22, 40)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Mode de paiement: ${vente.modePaiement}`, 6, y)
    y += 5

    if (typeof montantRecu === 'number') {
      doc.text(`Montant reçu: ${montantRecu.toLocaleString('fr-FR')} FCFA`, 6, y)
      y += 5
    }
    if (typeof rendu === 'number' && rendu > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text(`Rendu: ${rendu.toLocaleString('fr-FR')} FCFA`, 6, y)
      y += 5
    }

    if (vente.client && vente.client !== 'Client de passage' && vente.client !== 'Passage') {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.text(`Client: ${vente.client}`, 6, y)
      y += 5
    }

    y += 2
    sep()

    // ── Footer ─────────────────────────────────────────────────
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(10, 22, 40)
    doc.text('Merci pour votre achat !', W / 2, y, { align: 'center' })
    y += 6
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(155, 168, 196)
    doc.text('FORGE Afrika © 2026', W / 2, y, { align: 'center' })

    doc.save(`SUGU-recu-${vente.id.toString().slice(-6)}.pdf`)
  }

  return (
    <button
      onClick={genererPDF}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        minHeight: 52,
        background: 'rgba(227,160,15,0.1)',
        border: '1px solid #E3A00F',
        borderRadius: 12,
        color: '#E3A00F',
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: 'pointer',
        width: '100%',
        marginBottom: '0.75rem',
      }}
    >
      <FileDown size={18} />
      Télécharger PDF
    </button>
  )
}
