'use client'

import { AnimatePresence, m as motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'
import BoutiqueWelcome from '@/components/BoutiqueWelcome'
import { useBoutique } from '@/components/BoutiqueProvider'
import ScrollToTop from '@/components/ScrollToTop'
import SauvegardeBandeau from '@/components/SauvegardeBandeau'
import ShellSkeleton from '@/components/ShellSkeleton'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { loaded, boutiqueActive, boutiques } = useBoutique()
  const pathname = usePathname()

  if (!loaded) return <ShellSkeleton />

  if (boutiques.length === 0 || !boutiqueActive) {
    return <BoutiqueWelcome />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="sugu-main" style={{ flex: 1, padding: '2rem', overflowY: 'auto', minHeight: '100vh' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${pathname}::${boutiqueActive.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <SauvegardeBandeau />
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <ScrollToTop />
    </div>
  )
}
