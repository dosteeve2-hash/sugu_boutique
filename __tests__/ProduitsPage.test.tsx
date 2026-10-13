import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import type { Produit } from '@/lib/types'

// ─── Mocks (hoistés avant les imports) ───────────────────────────────────────

vi.mock('framer-motion', () => {
  const motion = {
    div: ({ children, initial, animate, exit, transition, whileHover, whileTap, ...rest }: any) =>
      <div {...rest}>{children}</div>,
    tr: ({ children, initial, animate, exit, transition, ...rest }: any) =>
      <tr {...rest}>{children}</tr>,
    p: ({ children, initial, animate, exit, transition, ...rest }: any) =>
      <p {...rest}>{children}</p>,
  }
  return { motion, m: motion, AnimatePresence: ({ children }: any) => <>{children}</> }
})

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => null,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ComposedChart: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

const mockSetProduits = vi.fn()
vi.mock('@/lib/storage', () => ({
  usePersistedBoutique: vi.fn(),
  usePersisted: vi.fn(),
}))

// ─── Import après les mocks ───────────────────────────────────────────────────

import { usePersistedBoutique } from '@/lib/storage'
import ProduitsPage from '@/app/produits/page'

// ─── Données de test ──────────────────────────────────────────────────────────

/** Produits tous en stock OK (aucune alerte) */
const PRODUITS_OK: Produit[] = [
  { id: 1001, nom: 'Riz local (sac 50 kg)',    categorie: 'Alimentaire', prixAchat: 18000, prixVente: 22000, stock: 12, stockMin: 5,  unite: 'sac' },
  { id: 1002, nom: 'Huile de palme 5 L',       categorie: 'Alimentaire', prixAchat: 3500,  prixVente: 4500,  stock: 8,  stockMin: 5,  unite: 'bidon' },
  { id: 1007, nom: 'Shampooing Tahiti 500 ml',  categorie: 'Hygiène',     prixAchat: 800,   prixVente: 1200,  stock: 14, stockMin: 5,  unite: 'flacon' },
  { id: 1009, nom: 'Eau minérale 1,5 L',        categorie: 'Boissons',    prixAchat: 350,   prixVente: 500,   stock: 48, stockMin: 12, unite: 'bouteille' },
  { id: 1012, nom: 'Allumettes Super (carton)', categorie: 'Divers',      prixAchat: 1500,  prixVente: 2500,  stock: 7,  stockMin: 5,  unite: 'carton' },
]

/** Produits avec alertes stock (stock ≤ stockMin) */
const PRODUITS_ALERTES: Produit[] = [
  ...PRODUITS_OK,
  { id: 1006, nom: 'Savon de Marseille 400 g', categorie: 'Hygiène',     prixAchat: 400,  prixVente: 600,  stock: 0,  stockMin: 10, unite: 'pièce' },   // critique
  { id: 1004, nom: 'Cube Maggi (boîte 100)',   categorie: 'Alimentaire', prixAchat: 2500, prixVente: 3500, stock: 2,  stockMin: 5,  unite: 'boîte' },   // bas
  { id: 1010, nom: 'Bière Brakina 65 cl',      categorie: 'Boissons',    prixAchat: 500,  prixVente: 750,  stock: 1,  stockMin: 6,  unite: 'bouteille' }, // bas
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setupMock(produits: Produit[] = PRODUITS_OK) {
  vi.mocked(usePersistedBoutique).mockReturnValue([produits, mockSetProduits, true] as any)
}

/**
 * Trouve un bouton de filtre par son libellé de début (insensible aux espaces).
 * Les boutons de filtre peuvent contenir un badge count : ex. "Hygiène" ou "Tous".
 */
function getFilterBtn(label: string): HTMLElement {
  const normalized = label.replace(/\s/g, '')
  const btn = screen.getAllByRole('button').find((b) =>
    b.textContent?.replace(/\s/g, '').startsWith(normalized)
  )
  if (!btn) throw new Error(`Bouton filtre introuvable : "${label}"`)
  return btn
}

/**
 * Ouvre le modal de modification de stock pour la première carte de produit.
 * Trouve le bouton "Stock" dans la barre d'actions de la première carte.
 */
function clickFirstStockButton() {
  const stockBtns = screen.getAllByText('Stock')
  fireEvent.click(stockBtns[0])
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProduitsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMock()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  // ── 1. Rendu de base ──────────────────────────────────────────────────────

  it('01 — se rend sans erreur', () => {
    expect(() => render(<ProduitsPage />)).not.toThrow()
  })

  it('02 — affiche le titre "Catalogue Produits"', () => {
    render(<ProduitsPage />)
    expect(screen.getByText('Catalogue Produits')).toBeInTheDocument()
  })

  it('03 — retourne null quand loaded=false', () => {
    vi.mocked(usePersistedBoutique).mockReturnValue([PRODUITS_OK, mockSetProduits, false] as any)
    const { container } = render(<ProduitsPage />)
    expect(container.firstChild).toBeNull()
  })

  it('04 — affiche le compteur de produits', () => {
    render(<ProduitsPage />)
    expect(screen.getByText(/5 produits/i)).toBeInTheDocument()
  })

  // ── 2. Bouton principal ───────────────────────────────────────────────────

  it('05 — affiche le bouton "Ajouter produit"', () => {
    render(<ProduitsPage />)
    expect(screen.getByText(/ajouter produit/i)).toBeInTheDocument()
  })

  // ── 3. Recherche ──────────────────────────────────────────────────────────

  it('06 — affiche le champ de recherche', () => {
    render(<ProduitsPage />)
    expect(screen.getByPlaceholderText(/rechercher un produit/i)).toBeInTheDocument()
  })

  it('07 — recherche par nom filtre les produits', () => {
    render(<ProduitsPage />)
    fireEvent.change(screen.getByPlaceholderText(/rechercher un produit/i), {
      target: { value: 'riz' },
    })
    expect(screen.getByText('Riz local (sac 50 kg)')).toBeInTheDocument()
    expect(screen.queryByText('Huile de palme 5 L')).not.toBeInTheDocument()
  })

  it('08 — recherche par catégorie filtre les produits', () => {
    render(<ProduitsPage />)
    fireEvent.change(screen.getByPlaceholderText(/rechercher un produit/i), {
      target: { value: 'boissons' },
    })
    expect(screen.getByText('Eau minérale 1,5 L')).toBeInTheDocument()
    expect(screen.queryByText('Riz local (sac 50 kg)')).not.toBeInTheDocument()
  })

  it('09 — affiche "Aucun produit trouvé" si aucun résultat', () => {
    render(<ProduitsPage />)
    fireEvent.change(screen.getByPlaceholderText(/rechercher un produit/i), {
      target: { value: 'xxxxxxxxxinexistant' },
    })
    expect(screen.getByText(/aucun produit trouvé/i)).toBeInTheDocument()
  })

  // ── 4. Filtres de catégorie ───────────────────────────────────────────────

  it('10 — affiche les filtres de catégorie', () => {
    render(<ProduitsPage />)
    expect(getFilterBtn('Tous')).toBeInTheDocument()
    expect(getFilterBtn('Alimentaire')).toBeInTheDocument()
    expect(getFilterBtn('Hygiène')).toBeInTheDocument()
    expect(getFilterBtn('Boissons')).toBeInTheDocument()
    expect(getFilterBtn('Divers')).toBeInTheDocument()
  })

  it('11 — filtre "Hygiène" : affiche Shampooing, masque Riz local', () => {
    render(<ProduitsPage />)
    fireEvent.click(getFilterBtn('Hygiène'))
    expect(screen.getByText('Shampooing Tahiti 500 ml')).toBeInTheDocument()
    expect(screen.queryByText('Riz local (sac 50 kg)')).not.toBeInTheDocument()
  })

  it('12 — filtre "Alimentaire" : affiche Riz, masque Shampooing', () => {
    render(<ProduitsPage />)
    fireEvent.click(getFilterBtn('Alimentaire'))
    expect(screen.getByText('Riz local (sac 50 kg)')).toBeInTheDocument()
    expect(screen.queryByText('Shampooing Tahiti 500 ml')).not.toBeInTheDocument()
  })

  it('13 — filtre "Boissons" : affiche Eau minérale, masque Riz', () => {
    render(<ProduitsPage />)
    fireEvent.click(getFilterBtn('Boissons'))
    expect(screen.getByText('Eau minérale 1,5 L')).toBeInTheDocument()
    expect(screen.queryByText('Riz local (sac 50 kg)')).not.toBeInTheDocument()
  })

  it('14 — filtre "Divers" : affiche Allumettes, masque Riz', () => {
    render(<ProduitsPage />)
    fireEvent.click(getFilterBtn('Divers'))
    expect(screen.getByText('Allumettes Super (carton)')).toBeInTheDocument()
    expect(screen.queryByText('Riz local (sac 50 kg)')).not.toBeInTheDocument()
  })

  // ── 5. Grille de produits ─────────────────────────────────────────────────

  it('15 — affiche les noms des produits dans la grille', () => {
    render(<ProduitsPage />)
    expect(screen.getByText('Riz local (sac 50 kg)')).toBeInTheDocument()
    expect(screen.getByText('Huile de palme 5 L')).toBeInTheDocument()
    expect(screen.getByText('Eau minérale 1,5 L')).toBeInTheDocument()
  })

  it('16 — affiche le prix de vente du premier produit', () => {
    render(<ProduitsPage />)
    // Riz local : prixVente=22000 → "22 000 FCFA"
    expect(screen.getByText(/22.*000 FCFA/)).toBeInTheDocument()
  })

  // ── 6. Bannière d'alerte ──────────────────────────────────────────────────

  it('17 — bannière d\'alerte visible quand il y a des ruptures', () => {
    setupMock(PRODUITS_ALERTES)
    render(<ProduitsPage />)
    expect(screen.getByText(/rupture ou stock faible/i)).toBeInTheDocument()
  })

  it('18 — pas de bannière d\'alerte si tous les stocks sont OK', () => {
    render(<ProduitsPage />)
    expect(screen.queryByText(/rupture ou stock faible/i)).not.toBeInTheDocument()
  })

  it('19 — badge "Critique" affiché pour produit à stock 0', () => {
    setupMock(PRODUITS_ALERTES)
    render(<ProduitsPage />)
    expect(screen.getAllByText('Critique').length).toBeGreaterThan(0)
  })

  it('20 — badge "Stock faible" affiché pour produit sous le seuil', () => {
    setupMock(PRODUITS_ALERTES)
    render(<ProduitsPage />)
    expect(screen.getAllByText(/stock faible/i).length).toBeGreaterThanOrEqual(1)
  })

  it('21 — clic × sur la bannière la ferme', () => {
    setupMock(PRODUITS_ALERTES)
    render(<ProduitsPage />)
    expect(screen.getByText(/rupture ou stock faible/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('×'))
    expect(screen.queryByText(/rupture ou stock faible/i)).not.toBeInTheDocument()
  })

  // ── 7. Filtre "Alertes seulement" ────────────────────────────────────────

  it('22 — bouton "Alertes seulement" avec badge rouge quand il y a des alertes', () => {
    setupMock(PRODUITS_ALERTES)
    render(<ProduitsPage />)
    expect(getFilterBtn('Alertes')).toBeInTheDocument()
    // Le badge rouge affiche le nombre d'alertes (3)
    const badge = screen.getByText('3')
    expect(badge).toBeInTheDocument()
  })

  it('23 — "Alertes seulement" filtre : affiche Savon (alerte), masque Riz (OK)', () => {
    setupMock(PRODUITS_ALERTES)
    render(<ProduitsPage />)
    fireEvent.click(getFilterBtn('Alertes'))
    expect(screen.getByText('Savon de Marseille 400 g')).toBeInTheDocument()
    expect(screen.queryByText('Riz local (sac 50 kg)')).not.toBeInTheDocument()
  })

  // ── 8. Modal "Modifier le stock" ─────────────────────────────────────────

  it('24 — bouton "Stock" ouvre le modal de modification de stock', () => {
    render(<ProduitsPage />)
    clickFirstStockButton()
    expect(screen.getByText('Modifier le stock')).toBeInTheDocument()
  })

  it('25 — modal stock : affiche le nom du produit', () => {
    render(<ProduitsPage />)
    clickFirstStockButton()
    expect(screen.getAllByText('Riz local (sac 50 kg)').length).toBeGreaterThan(0)
  })

  it('26 — modal stock : boutons de restock rapide +10, +25, +50', () => {
    render(<ProduitsPage />)
    clickFirstStockButton()
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('+25')).toBeInTheDocument()
    expect(screen.getByText('+50')).toBeInTheDocument()
  })

  it('27 — clic +10 appelle setProduits', () => {
    render(<ProduitsPage />)
    clickFirstStockButton()
    fireEvent.click(screen.getByText('+10'))
    expect(mockSetProduits).toHaveBeenCalledTimes(1)
  })

  it('28 — clic +25 appelle setProduits', () => {
    render(<ProduitsPage />)
    clickFirstStockButton()
    fireEvent.click(screen.getByText('+25'))
    expect(mockSetProduits).toHaveBeenCalledTimes(1)
  })

  it('29 — clic +50 appelle setProduits', () => {
    render(<ProduitsPage />)
    clickFirstStockButton()
    fireEvent.click(screen.getByText('+50'))
    expect(mockSetProduits).toHaveBeenCalledTimes(1)
  })

  it('30 — modal stock : champ variation manuelle présent', () => {
    render(<ProduitsPage />)
    clickFirstStockButton()
    expect(screen.getByPlaceholderText(/ex: \+20 ou -5/i)).toBeInTheDocument()
  })

  // ── 9. Modal "Ajouter / Modifier produit" ─────────────────────────────────

  it('31 — "Ajouter produit" → ouvre le modal formulaire', () => {
    render(<ProduitsPage />)
    fireEvent.click(screen.getByText(/ajouter produit/i))
    expect(screen.getByText('Ajouter un produit')).toBeInTheDocument()
  })

  it('32 — modal ajout : champ "Nom du produit"', () => {
    render(<ProduitsPage />)
    fireEvent.click(screen.getByText(/ajouter produit/i))
    expect(screen.getByText('Nom du produit')).toBeInTheDocument()
  })

  it('33 — modal ajout : sélecteur de catégorie présent', () => {
    render(<ProduitsPage />)
    fireEvent.click(screen.getByText(/ajouter produit/i))
    expect(screen.getByText('Catégorie')).toBeInTheDocument()
  })

  it('34 — modal ajout : placeholder "Ex: Huile de Palme 5L"', () => {
    render(<ProduitsPage />)
    fireEvent.click(screen.getByText(/ajouter produit/i))
    expect(screen.getByPlaceholderText(/huile de palme 5l/i)).toBeInTheDocument()
  })
})

describe('ProduitsPage — catalogue vide honnête', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ne injecte aucun produit fictif quand le catalogue est vide', () => {
    vi.mocked(usePersistedBoutique).mockReturnValue([[], mockSetProduits, true] as any)
    render(<ProduitsPage />)
    expect(mockSetProduits).not.toHaveBeenCalled()
    expect(screen.queryByText('Riz local (sac 50 kg)')).not.toBeInTheDocument()
  })

  it('affiche un grand bouton "Ajoutez votre premier produit"', () => {
    vi.mocked(usePersistedBoutique).mockReturnValue([[], mockSetProduits, true] as any)
    render(<ProduitsPage />)
    expect(screen.getByRole('button', { name: /ajoutez votre premier produit/i })).toBeInTheDocument()
  })
})
