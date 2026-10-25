'use client'

import Image from 'next/image'
import { m as motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const lignes = [
  { nom: 'Tomates', quantite: '2 × 350 FCFA', montant: '700 FCFA' },
  { nom: 'Savon', quantite: '1 × 500 FCFA', montant: '500 FCFA' },
]

export default function RecuQuiSImprime() {
  const receiptRef = useRef<HTMLDivElement>(null)
  const visible = useInView(receiptRef, { once: true, amount: 0.45 })

  return (
    <div className="receipt-paper" ref={receiptRef} aria-label="Exemple illustratif de reçu de vente">
      <div className="receipt-brand">
        <Image src="/brand/mark.svg" alt="" width={32} height={32} />
        <strong>SUGU</strong>
        <span className="receipt-caption">Exemple illustratif</span>
      </div>
      <p className="receipt-date">Votre vente, ligne par ligne</p>
      <div className="receipt-lines">
        {lignes.map((ligne, index) => (
          <motion.div
            className="receipt-line receipt-line-motion"
            key={ligne.nom}
            initial={{ opacity: 0, y: 14 }}
            animate={visible ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.42, delay: index * 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>{ligne.nom}<small>{ligne.quantite}</small></span>
            <strong>{ligne.montant}</strong>
          </motion.div>
        ))}
        <motion.div
          className="receipt-total receipt-line-motion"
          initial={{ opacity: 0, y: 14 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.42, delay: lignes.length * 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>Total</span><strong>1 200 FCFA</strong>
        </motion.div>
        <motion.p
          className="receipt-payment receipt-line-motion"
          initial={{ opacity: 0, y: 14 }}
          animate={visible ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.42, delay: (lignes.length + 1) * 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          Mode noté : Orange Money
        </motion.p>
      </div>
    </div>
  )
}
