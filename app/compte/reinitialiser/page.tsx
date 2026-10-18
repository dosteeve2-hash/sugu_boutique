import { Suspense } from 'react'
import ReinitialiserClient from '@/components/ReinitialiserClient'

export default function PageReinitialiser() {
  return (
    <Suspense fallback={null}>
      <ReinitialiserClient />
    </Suspense>
  )
}
