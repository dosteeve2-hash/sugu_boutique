import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tarifs | SUGU',
  description: 'État des tarifs de SUGU. Le produit est en développement et aucun tarif futur n’est annoncé.',
}

export default function TarifsPage() {
  return (
    <main id="contenu">
      <section className="info-hero site-container">
        <p className="eyebrow">Tarifs</p>
        <h1>Pas de tarif annoncé.</h1>
        <p>SUGU est en développement. Aucun tarif pour la suite n&apos;est annoncé pour le moment.</p>
      </section>

      <section className="price-panel site-container" aria-labelledby="price-title">
        <div>
          <h2 id="price-title">Aujourd&apos;hui, le produit n&apos;a pas de formule payante.</h2>
          <p>Il n&apos;y a ni abonnement ni paiement intégré à l&apos;application SUGU. Les conditions de la suite seront précisées quand le produit évoluera.</p>
        </div>
        <div className="price-list">
          <p><strong>Application</strong><br />Accessible pendant le développement, sans tarif annoncé.</p>
          <p><strong>Compte et sauvegarde en ligne</strong><br />Compte facultatif et gratuit. La boutique fonctionne aussi sans compte.</p>
          <p><strong>Données locales</strong><br />Enregistrées sur le téléphone. L&apos;export de sauvegarde est disponible dans les paramètres.</p>
        </div>
      </section>

      <section className="info-section">
        <p className="eyebrow">Une précision</p>
        <h2 className="section-heading">Le mode de paiement est enregistré, pas encaissé.</h2>
        <p className="section-lead">SUGU peut noter espèces, Orange Money, Wave, Moov Money ou crédit. L&apos;application ne transfère pas d&apos;argent et ne confirme pas la réception d&apos;un paiement mobile.</p>
      </section>

      <section className="closing-cta">
        <div className="site-container closing-cta-inner">
          <h2>Gardez vos ventes au même endroit.</h2>
          <Link className="primary-action" href="/app">Ouvrir SUGU <span className="action-icon"><ArrowUpRight size={17} strokeWidth={2.5} aria-hidden="true" /></span></Link>
        </div>
      </section>
    </main>
  )
}
