import { describe, it, expect } from 'vitest'
import { ecrireLocal, type StockageMinimal } from '@/lib/persistance'

/** Un localStorage qui refuse d'écrire, comme un appareil dont la mémoire est pleine. */
function stockagePlein(nom = 'QuotaExceededError', code?: number): StockageMinimal {
  return {
    setItem() {
      const e = new Error('quota') as Error & { code?: number }
      e.name = nom
      if (code !== undefined) e.code = code
      throw e
    },
  }
}

function stockageQuiMarche(): StockageMinimal & { contenu: Record<string, string> } {
  const contenu: Record<string, string> = {}
  return {
    contenu,
    setItem(cle, valeur) {
      contenu[cle] = valeur
    },
  }
}

describe('ecrireLocal — une écriture refusée doit se voir', () => {
  it('1. retourne null quand l\'écriture passe', () => {
    const s = stockageQuiMarche()
    expect(ecrireLocal('sugu_1_ventes', [{ id: 1 }], s)).toBeNull()
  })

  it('2. sérialise bien la valeur', () => {
    const s = stockageQuiMarche()
    ecrireLocal('sugu_1_ventes', [{ id: 1, total: 2500 }], s)
    expect(JSON.parse(s.contenu['sugu_1_ventes'])).toEqual([{ id: 1, total: 2500 }])
  })

  it('3. signale un quota dépassé par le nom de l\'erreur', () => {
    expect(ecrireLocal('k', {}, stockagePlein())).toEqual({ cle: 'k', raison: 'quota' })
  })

  it('4. reconnaît aussi le code 22 des navigateurs historiques', () => {
    expect(ecrireLocal('k', {}, stockagePlein('Error', 22))).toEqual({
      cle: 'k',
      raison: 'quota',
    })
  })

  it('5. reconnaît le code 1014 de Firefox', () => {
    expect(ecrireLocal('k', {}, stockagePlein('Error', 1014))).toEqual({
      cle: 'k',
      raison: 'quota',
    })
  })

  it('6. classe les autres refus en « indisponible » — navigation privée, stockage bloqué', () => {
    expect(ecrireLocal('k', {}, stockagePlein('SecurityError'))).toEqual({
      cle: 'k',
      raison: 'indisponible',
    })
  })

  it('7. une valeur non sérialisable est un échec, pas une exception qui remonte', () => {
    const cyclique: Record<string, unknown> = {}
    cyclique.self = cyclique
    expect(ecrireLocal('k', cyclique, stockageQuiMarche())).toEqual({
      cle: 'k',
      raison: 'indisponible',
    })
  })

  it('8. ne perd jamais la main : aucune écriture ne lève', () => {
    expect(() => ecrireLocal('k', {}, stockagePlein())).not.toThrow()
  })
})
