'use client'

import { LazyMotion } from 'framer-motion'

const chargerFonctions = () => import('@/lib/motionFeatures').then((mod) => mod.default)

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={chargerFonctions}>{children}</LazyMotion>
}
