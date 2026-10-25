import type { ReactNode } from 'react'
import Footer from '@/components/site/Footer'
import Header from '@/components/site/Header'
import PublicMotion from '@/components/site/PublicMotion'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <PublicMotion>
      <div className="public-site">
        <a className="skip-link" href="#contenu">Aller au contenu</a>
        <Header />
        {children}
        <Footer />
      </div>
    </PublicMotion>
  )
}
