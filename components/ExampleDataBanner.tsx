'use client'

import { usePathname } from 'next/navigation'

const EXAMPLE_ROUTES = ['/commandes', '/historique', '/produits', '/promotions', '/statistiques']

export default function ExampleDataBanner() {
  const pathname = usePathname()
  if (!EXAMPLE_ROUTES.some((route) => pathname.startsWith(route))) return null

  return (
    <div
      role="note"
      style={{
        marginBottom: '1.25rem',
        padding: '0.75rem 1rem',
        borderRadius: 12,
        background: '#111d34',
        border: '1px solid #1f3054',
        color: '#9ba8c4',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <strong style={{ color: '#f0a832' }}>Données d&apos;exemple.</strong> Les noms, produits,
      ventes et montants affichés ici sont fictifs et servent à illustrer SUGU. Ils ne proviennent
      d&apos;aucun commerce réel et peuvent être remplacés par vos propres données.
    </div>
  )
}
