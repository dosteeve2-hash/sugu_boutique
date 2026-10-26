'use client'

import { m as motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const produits = [
  { id: 'mangue', label: 'Mangue', forme: 'mangue' },
  { id: 'tomate', label: 'Tomate', forme: 'tomate' },
  { id: 'sachet', label: 'Sachet de céréales', forme: 'sachet' },
]

function IllustrationProduit({ forme }: { forme: string }) {
  if (forme === 'mangue') {
    return (
      <svg viewBox="0 0 120 140" role="img" aria-label="Illustration d’une mangue">
        <path d="M57 26c-9-13 2-20 14-18-2 8-6 14-14 18Z" fill="#6e8b44" />
        <path d="M60 31c-16-8-32 2-39 21-8 22 7 58 27 66 17 7 40-9 49-31 9-22-4-49-24-56-4-1-8-1-13 0Z" fill="#e3a00f" />
        <path d="M44 45c-8 10-11 25-8 37" fill="none" stroke="#f7c95c" strokeLinecap="round" strokeWidth="7" />
        <ellipse cx="75" cy="91" rx="17" ry="9" fill="#d58c06" opacity=".45" transform="rotate(-38 75 91)" />
      </svg>
    )
  }

  if (forme === 'tomate') {
    return (
      <svg viewBox="0 0 120 140" role="img" aria-label="Illustration d’une tomate">
        <path d="M61 39c-21-15-47-1-46 26 1 25 17 44 43 43 27 1 44-18 44-43 0-27-25-41-41-26Z" fill="#c94d34" />
        <path d="m60 39-7-16 13 9 10-13-2 18 17 0-15 9M59 40 42 31l8 15-16 3 18 5" fill="#587a3d" stroke="#587a3d" strokeLinejoin="round" strokeWidth="5" />
        <path d="M32 61c3-9 9-13 15-14" fill="none" stroke="#e98160" strokeLinecap="round" strokeWidth="5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 140" role="img" aria-label="Illustration d’un sachet de céréales">
      <path d="m34 35 8-13h36l8 13 8 83H26l8-83Z" fill="#d7b875" />
      <path d="M34 35h52l2 15H32l2-15Z" fill="#eee0b7" />
      <path d="M38 73h44v25H38z" fill="#1f3a2b" />
      <path d="M48 85h24" stroke="#e3a00f" strokeLinecap="round" strokeWidth="4" />
      <path d="M43 22h34" stroke="#aa8d50" strokeLinecap="round" strokeWidth="4" />
    </svg>
  )
}

export default function EtalQuiSeRemplit() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  })
  const yMangue = useTransform(scrollYProgress, [0, 1], [95, 0])
  const yTomate = useTransform(scrollYProgress, [0, 1], [120, 0])
  const ySachet = useTransform(scrollYProgress, [0, 1], [145, 0])
  const opacite = useTransform(scrollYProgress, [0, 0.55, 1], [0.2, 0.7, 1])
  const positions = [yMangue, yTomate, ySachet]

  return (
    <section className="etal-section" ref={sectionRef} aria-labelledby="etal-title">
      <div className="site-container etal-layout">
        <div className="etal-copy">
          <p className="eyebrow">Produits et stock</p>
          <h2 className="section-heading" id="etal-title">Votre étal, rangé dans votre téléphone.</h2>
          <p className="section-lead">Ajoutez vos produits une fois. SUGU suit les ventes et le stock restant avec vos données.</p>
        </div>
        <div className="market-stand" aria-label="Illustration d’un étal qui se remplit de produits">
          <div className="stand-awning" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
          </div>
          <div className="stand-shelf">
            {produits.map((produit, index) => (
              <motion.div
                key={produit.id}
                className="stand-product stand-product-motion"
                style={{ y: positions[index], opacity: opacite }}
                aria-label={produit.label}
              >
                <IllustrationProduit forme={produit.forme} />
              </motion.div>
            ))}
          </div>
          <p className="stand-caption">Une place pour chaque produit.</p>
        </div>
      </div>
    </section>
  )
}
