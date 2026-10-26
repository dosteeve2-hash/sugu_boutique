import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="site-header site-container">
      <Link className="site-logo" href="/" aria-label="SUGU, accueil">
        <Image src="/brand/logo.svg" alt="SUGU" width={164} height={64} priority />
      </Link>
      <nav className="site-nav" aria-label="Navigation principale">
        <Link href="/fonctionnalites">Fonctionnalités</Link>
        <Link href="/tarifs">Tarifs</Link>
      </nav>
    </header>
  )
}
