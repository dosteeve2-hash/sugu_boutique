import type { Metadata } from 'next'
import credits from '@/lib/credits-photos.json'

export const metadata: Metadata = {
  title: 'Crédits photo | SUGU',
  description: 'Auteurs, licences et sources des photographies utilisées sur le site SUGU.',
}

export default function CreditsPage() {
  return (
    <main id="contenu" className="site-container">
      <section className="info-hero">
        <p className="eyebrow">Images et licences</p>
        <h1>Les images ont une histoire.</h1>
        <p>Photographies issues de Wikimedia Commons et fournies avec leurs crédits d&apos;auteur et de licence.</p>
      </section>
      <section className="credits-list" aria-label="Photographies utilisées">
        {credits.map((photo) => (
          <article className="credit-item" key={photo.slug}>
            <h2>{photo.titre}</h2>
            <p><strong>Auteur :</strong> {photo.auteur}</p>
            <p><strong>Licence :</strong> <a href={photo.licenceUrl} target="_blank" rel="noreferrer">{photo.licence}</a></p>
            <p><strong>Source :</strong> <a href={photo.source} target="_blank" rel="noreferrer">Wikimedia Commons</a></p>
            <p><strong>Fichier :</strong> {photo.fichier} · {photo.width} × {photo.height} px</p>
            <p><strong>Modification :</strong> {photo.modifications}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
