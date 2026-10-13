import { describe, it, expect, beforeEach } from 'vitest'
import {
  analyserSauvegarde,
  collecterDonnees,
  creerSauvegarde,
  joursDepuisExport,
  restaurerSauvegarde,
  CLE_DERNIER_EXPORT,
} from '@/lib/backup'

describe('sauvegarde locale', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem('sugu_boutiques', JSON.stringify([{ id: 'bt_1', nom: 'Ma friperie' }]))
    window.localStorage.setItem('sugu_bt_1_produits', JSON.stringify([{ id: 1, nom: 'Robe' }]))
    window.localStorage.setItem('sugu_langue', 'fr')
    window.localStorage.setItem('autre_site', 'secret')
  })

  it('ne collecte que les clés sugu_ et jamais la date du dernier export', () => {
    window.localStorage.setItem(CLE_DERNIER_EXPORT, new Date().toISOString())
    const donnees = collecterDonnees(window.localStorage)
    expect(Object.keys(donnees).sort()).toEqual(['sugu_boutiques', 'sugu_bt_1_produits', 'sugu_langue'])
  })

  it('aller-retour : export, effacement, import restitue les données', () => {
    const sauvegarde = creerSauvegarde(window.localStorage)
    window.localStorage.clear()
    const analyse = analyserSauvegarde(JSON.stringify(sauvegarde))
    expect(analyse.ok).toBe(true)
    if (!analyse.ok) return
    expect(restaurerSauvegarde(window.localStorage, analyse.sauvegarde)).toBe(3)
    expect(JSON.parse(window.localStorage.getItem('sugu_bt_1_produits') ?? '[]')).toEqual([{ id: 1, nom: 'Robe' }])
  })

  it('la restauration remplace les anciennes données sugu_ mais laisse les autres clés', () => {
    const sauvegarde = creerSauvegarde(window.localStorage)
    window.localStorage.setItem('sugu_bt_2_produits', '[]')
    restaurerSauvegarde(window.localStorage, sauvegarde)
    expect(window.localStorage.getItem('sugu_bt_2_produits')).toBeNull()
    expect(window.localStorage.getItem('autre_site')).toBe('secret')
  })

  it('refuse un fichier qui n est pas du JSON', () => {
    expect(analyserSauvegarde('pas du json').ok).toBe(false)
  })

  it('refuse un JSON étranger', () => {
    expect(analyserSauvegarde(JSON.stringify({ a: 1 })).ok).toBe(false)
  })

  it('refuse une clé qui sort du préfixe sugu_', () => {
    const faux = { format: 'sugu-sauvegarde', version: 1, exporteLe: '', donnees: { sugu_boutiques: '[]', autre: '1' } }
    expect(analyserSauvegarde(JSON.stringify(faux)).ok).toBe(false)
  })

  it('refuse une sauvegarde sans boutique', () => {
    const faux = { format: 'sugu-sauvegarde', version: 1, exporteLe: '', donnees: { sugu_langue: 'fr' } }
    expect(analyserSauvegarde(JSON.stringify(faux)).ok).toBe(false)
  })

  it('calcule les jours depuis le dernier export', () => {
    expect(joursDepuisExport(window.localStorage)).toBeNull()
    window.localStorage.setItem(CLE_DERNIER_EXPORT, '2026-10-10T08:00:00.000Z')
    expect(joursDepuisExport(window.localStorage, new Date('2026-10-13T09:00:00.000Z'))).toBe(3)
  })
})
