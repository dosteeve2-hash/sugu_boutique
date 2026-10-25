import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <div className="footer-brand">
          <Image src="/brand/mark.svg" alt="" width={38} height={38} />
          <span>SUGU</span>
        </div>
        <nav className="footer-links" aria-label="Liens de pied de page">
          <Link href="/fonctionnalites">Fonctionnalités</Link>
          <Link href="/tarifs">Tarifs</Link>
          <Link href="/credits">Crédits photos</Link>
          <a href="mailto:docompaore2@gmail.com">Nous écrire</a>
        </nav>
        <p className="footer-note">SUGU est en développement. Un outil pensé pour le quotidien du petit commerce.</p>
      </div>
    </footer>
  )
}
