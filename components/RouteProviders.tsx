'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { BoutiqueProvider } from '@/components/BoutiqueProvider'
import { LangueProvider } from '@/components/LangueProvider'
import MotionProvider from '@/components/MotionProvider'
import { SyncProvider } from '@/components/SyncProvider'

const PUBLIC_PATHS = new Set(['/', '/tarifs', '/fonctionnalites', '/credits'])

export default function RouteProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (PUBLIC_PATHS.has(pathname)) {
    return <MotionProvider>{children}</MotionProvider>
  }

  return (
    <MotionProvider>
      <LangueProvider>
        <BoutiqueProvider>
          <SyncProvider>
            <AppShell>{children}</AppShell>
          </SyncProvider>
        </BoutiqueProvider>
      </LangueProvider>
    </MotionProvider>
  )
}
