import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import AlerteStockage from '@/components/AlerteStockage'
import { signalerEchec, oublierEchecs } from '@/lib/persistance'

/**
 * Ce que le commerçant doit voir quand une écriture échoue. C'est le seul
 * endroit où le défaut devient visible : sans cette bannière, l'écran
 * continue d'afficher une vente qui n'a pas été enregistrée.
 */
describe('AlerteStockage', () => {
  beforeEach(() => act(() => oublierEchecs()))
  afterEach(() => act(() => oublierEchecs()))

  it('1. n\'affiche rien tant que tout va bien', () => {
    const { container } = render(<AlerteStockage />)
    expect(container).toBeEmptyDOMElement()
  })

  it('2. apparaît dès qu\'une écriture échoue', () => {
    render(<AlerteStockage />)
    act(() => signalerEchec({ cle: 'sugu_1_ventes', raison: 'quota' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('3. dit de ne pas fermer la page — c\'est là que les données se perdent', () => {
    render(<AlerteStockage />)
    act(() => signalerEchec({ cle: 'sugu_1_ventes', raison: 'quota' }))
    expect(screen.getByRole('alert')).toHaveTextContent('ne fermez pas cette page')
  })

  it('4. quota dépassé : explique que la mémoire est pleine et quoi faire', () => {
    render(<AlerteStockage />)
    act(() => signalerEchec({ cle: 'sugu_1_ventes', raison: 'quota' }))
    const alerte = screen.getByRole('alert')
    expect(alerte).toHaveTextContent(/mémoire de l'appareil est pleine/i)
    expect(alerte).toHaveTextContent(/libérez de l'espace/i)
  })

  it('5. stockage indisponible : parle de navigation privée, pas de mémoire pleine', () => {
    render(<AlerteStockage />)
    act(() => signalerEchec({ cle: 'sugu_1_ventes', raison: 'indisponible' }))
    const alerte = screen.getByRole('alert')
    expect(alerte).toHaveTextContent(/navigation privée/i)
    expect(alerte).not.toHaveTextContent(/mémoire de l'appareil est pleine/i)
  })

  it('6. une clé qui échoue en boucle n\'empile pas les bannières', () => {
    render(<AlerteStockage />)
    act(() => {
      signalerEchec({ cle: 'sugu_1_ventes', raison: 'quota' })
      signalerEchec({ cle: 'sugu_1_ventes', raison: 'quota' })
      signalerEchec({ cle: 'sugu_1_ventes', raison: 'quota' })
    })
    expect(screen.getAllByRole('alert')).toHaveLength(1)
  })

  it('7. deux clés distinctes restent un seul bandeau', () => {
    render(<AlerteStockage />)
    act(() => {
      signalerEchec({ cle: 'sugu_1_ventes', raison: 'quota' })
      signalerEchec({ cle: 'sugu_1_produits', raison: 'quota' })
    })
    expect(screen.getAllByRole('alert')).toHaveLength(1)
  })

  it('8. ne s\'imprime pas sur un ticket de caisse', () => {
    render(<AlerteStockage />)
    act(() => signalerEchec({ cle: 'sugu_1_ventes', raison: 'quota' }))
    expect(screen.getByRole('alert')).toHaveClass('no-print')
  })
})
