import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fonctionnalités | SUGU',
  description: 'Découvrez les outils disponibles dans SUGU pour suivre les produits, ventes, achats, clients, stock et rapports.',
}

const details = [
  {
    titre: 'Produits et stock',
    texte: 'Ajoutez vos articles, leurs prix d’achat et de vente, leurs quantités. Une vente diminue le stock ; les faibles niveaux sont signalés.',
  },
  {
    titre: 'Ventes et reçus',
    texte: 'Composez une vente, notez le mode choisi puis consultez, imprimez ou partagez son reçu depuis le téléphone.',
  },
  {
    titre: 'Achats et fournisseurs',
    texte: 'Enregistrez les achats auprès de vos fournisseurs. Un achat livré augmente le stock des produits concernés.',
  },
  {
    titre: 'Clients et crédit',
    texte: 'Gardez les coordonnées de vos clients et le solde des ventes à crédit. SUGU demande un client pour enregistrer un crédit.',
  },
  {
    titre: 'Rapports et marge estimée',
    texte: 'Consultez les ventes et achats. La marge n’est calculée que pour les produits dont le prix d’achat est connu.',
  },
  {
    titre: 'Quatre langues',
    texte: 'Les menus existent en français, anglais, jula et mooré. Les deux traductions en langues locales sont en relecture et certains écrans restent en français.',
  },
]

export default function FonctionnalitesPage() {
  return (
    <main id="contenu">
      <section className="info-hero site-container">
        <p className="eyebrow">Un cahier simple, sur téléphone</p>
        <h1>Ce qu&apos;il faut pour garder le fil de la boutique.</h1>
        <p>SUGU est en développement. Voici ce qu&apos;elle permet déjà.</p>
      </section>

      <section className="info-section" aria-label="Un étal de commerce">
        <div className="info-photo">
          <Image
            src="/images/photos/commerce-boutique.webp"
            alt="Vue rapprochée d’une petite boutique et de ses produits."
            fill
            loading="lazy"
            sizes="(max-width: 768px) 92vw, 80vw"
          />
        </div>
      </section>

      <section className="info-section" aria-label="Fonctionnalités disponibles">
        <div className="feature-detail-grid">
          {details.map((detail) => (
            <article className="feature-detail" key={detail.titre}>
              <h2>{detail.titre}</h2>
              <p>{detail.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info-section">
        <div className="trust-layout">
          <div>
            <p className="eyebrow">Données et connexion</p>
            <h2 className="section-heading">Le téléphone d&apos;abord.</h2>
          </div>
          <p className="section-lead">
            Vos données sont enregistrées sur le téléphone. L&apos;application peut rouvrir ses pages hors ligne après un premier chargement connecté. Un compte gratuit reste facultatif pour la sauvegarde en ligne.
          </p>
        </div>
      </section>

      <section className="trust-band" aria-labelledby="payment-note-title">
        <div className="site-container">
          <p className="eyebrow">À savoir</p>
          <h2 className="section-heading" id="payment-note-title">SUGU note le paiement choisi.</h2>
          <p className="trust-copy">Espèces, Orange Money, Wave, Moov Money ou crédit. Les paiements mobiles ne sont pas exécutés ni vérifiés par SUGU.</p>
        </div>
      </section>

      <section className="closing-cta">
        <div className="site-container closing-cta-inner">
          <h2>Essayez les gestes du quotidien dans SUGU.</h2>
          <Link className="primary-action" href="/app">Essayer SUGU <span className="action-icon"><ArrowUpRight size={17} strokeWidth={2.5} aria-hidden="true" /></span></Link>
        </div>
      </section>
    </main>
  )
}
