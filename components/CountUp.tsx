'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

export default function CountUp({ value, format }: { value: number; format?: (v: number) => string }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const controls = animate(prevRef.current, value, {
      duration: 0.7,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    })
    prevRef.current = value
    return () => controls.stop()
  }, [value])

  return <>{format ? format(display) : Math.round(display)}</>
}
