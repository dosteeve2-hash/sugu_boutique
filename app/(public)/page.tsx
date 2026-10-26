import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import EtalQuiSeRemplit from '@/components/site/EtalQuiSeRemplit'
import RecuQuiSImprime from '@/components/site/RecuQuiSImprime'

export const metadata: Metadata = {
  title: 'SUGU | Sachez ce que vous avez gagné',
  description: 'Le cahier de comptes du commerçant, devenu simple. Suivez vos ventes, achats, produits et stock sur votre téléphone.',
}

const fonctions = ['Produits', 'Ventes', 'Achats', 'Clients', 'Stock', 'Rapports']

export default function AccueilPublic() {
  return (
    <main id="contenu">
      <section className="site-container site-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Le cahier de comptes du commerçant, devenu simple.</p>
          <h1 className="hero-title" id="hero-title">
            <span>Sachez chaque</span>{' '}
            <span>soir ce que</span>{' '}
            <span>vous avez <em>gagné.</em></span>
          </h1>
          <p className="hero-intro">
            Produits, ventes, achats, clients, stock et rapports. SUGU garde vos comptes au même endroit, sur votre téléphone.
          </p>
          <Link className="primary-action" href="/app">
            Essayer SUGU <span className="action-icon"><ArrowUpRight size={17} strokeWidth={2.5} aria-hidden="true" /></span>
          </Link>
          <p className="hero-note">La marge estimée s’affiche quand le prix d’achat est renseigné.</p>
          <p className="status-line">SUGU est en développement.</p>
        </div>

        <div className="hero-visual">
          <div className="hero-awning" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
          </div>
          <div className="hero-photo-frame">
            <Image
              className="hero-photo"
              src="/images/photos/commerce-etal.webp"
              alt="Un étal de marché garni de fruits et légumes."
              fill
              priority
              sizes="(max-width: 768px) 92vw, 48vw"
            />
            <div className="hero-brand-lockup">
              <Image src="/brand/logo-sombre.svg" alt="" width={208} height={88} priority />
            </div>
            <p className="hero-photo-caption">Le marché en vrai. SUGU pour tenir les comptes.</p>
          </div>
        </div>
      </section>

      <EtalQuiSeRemplit />

      <section className="section-light site-container receipt-section" aria-labelledby="receipt-title">
        <div className="receipt-explainer">
          <p className="eyebrow">De la vente au reçu</p>
          <h2 className="section-heading" id="receipt-title">Une vente. Un reçu. C&apos;est noté.</h2>
          <p className="section-lead">
            Touchez les produits, choisissez le mode de paiement et validez. Le reçu peut être consulté, imprimé ou partagé depuis le téléphone.
          </p>
          <div className="receipt-mode-list" aria-label="Modes de paiement que SUGU peut noter">
            <span>Espèces</span><span>Orange Money</span><span>Wave</span><span>Moov Money</span><span>Crédit</span>
          </div>
          <p className="receipt-fineprint">SUGU enregistre le mode choisi. Il ne déclenche ni ne vérifie les transferts d&apos;argent mobile.</p>
        </div>
        <RecuQuiSImprime />
      </section>

      <section className="capabilities-section" aria-labelledby="capabilities-title">
        <div className="site-container capabilities-layout">
          <div>
            <p className="eyebrow">Pour tenir la boutique</p>
            <h2 className="section-heading" id="capabilities-title">Les gestes du commerce, réunis.</h2>
            <p className="section-lead">L&apos;application suit les mouvements de votre boutique et met à jour le stock à chaque vente.</p>
          </div>
          <div className="capabilities-list">
            {fonctions.map((fonction) => (
              <div className="capability-row" key={fonction}>
                <span aria-hidden="true"><Check size={16} strokeWidth={2.5} /></span>{fonction}
              </div>
            ))}
            <div className="capability-row"><span aria-hidden="true"><Check size={16} strokeWidth={2.5} /></span>Crédit à la caisse</div>
            <div className="capability-row"><span aria-hidden="true"><Check size={16} strokeWidth={2.5} /></span>Fournisseurs</div>
          </div>
        </div>
      </section>

      <section className="trust-band" aria-labelledby="trust-title">
        <div className="site-container trust-layout">
          <div>
            <p className="eyebrow">Sur votre téléphone</p>
            <h2 className="section-heading" id="trust-title">Vos comptes restent à vous.</h2>
            <p className="trust-copy">
              Sans compte, vos données sont enregistrées sur ce téléphone. Vous pouvez les exporter pour garder une copie. Un compte gratuit est facultatif pour sauvegarder en ligne.
            </p>
          </div>
          <div className="trust-notes">
            <p>Après un premier chargement connecté, les pages de l&apos;application peuvent rester accessibles hors ligne.</p>
            <p>La sauvegarde en ligne nécessite un compte et une connexion.</p>
          </div>
        </div>
      </section>

      <section className="language-note site-container" aria-label="Langues de l’application">
        <p>Menus en français, anglais, jula et mooré. Les traductions jula et mooré sont en relecture ; certains écrans restent en français.</p>
        <div className="language-badges" aria-hidden="true">
          <span>Français</span><span>English</span><span>Jula</span><span>Mooré</span>
        </div>
      </section>

      <section className="closing-cta" aria-labelledby="closing-title">
        <div className="site-container closing-cta-inner">
          <h2 id="closing-title">Le cahier peut tenir dans votre poche.</h2>
          <Link className="primary-action" href="/app">Ouvrir SUGU <span className="action-icon"><ArrowUpRight size={17} strokeWidth={2.5} aria-hidden="true" /></span></Link>
        </div>
      </section>
    </main>
  )
}
