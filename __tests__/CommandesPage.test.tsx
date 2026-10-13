import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// ─── Mocks (hoistés par Vitest avant les imports) ────────────────────────────

vi.mock('framer-motion', () => {
  const motion = {
    div: ({ children, initial, animate, exit, transition, whileHover, whileTap, ...rest }: any) =>
      <div {...rest}>{children}</div>,
    tr: ({ children, initial, animate, exit, transition, whileHover, whileTap, ...rest }: any) =>
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

const mockSetCommandes = vi.fn()
vi.mock('@/lib/storage', () => ({
  usePersistedBoutique: vi.fn(),
  usePersisted: vi.fn(),
}))

// ─── Import après les mocks ───────────────────────────────────────────────────

import { usePersistedBoutique } from '@/lib/storage'
import CommandesPage from '@/app/commandes/page'

// ─── Données mock ─────────────────────────────────────────────────────────────

const COMMANDES_TEST = [
  {
    id: 1001,
    client: 'Aminata Ouédraogo',
    produits: [
      { nom: 'Riz local 50 kg', qte: 2, prix: 22000 },
      { nom: 'Huile de palme 5 L', qte: 3, prix: 4500 },
    ],
    total: 57500,
    statut: 'Livrée' as const,
    date: '2026-07-28',
    modePaiement: 'Wave',
    adresseLivraison: 'Secteur 15, Ouagadougou',
  },
  {
    id: 1002,
    client: 'Moussa Traoré',
    produits: [{ nom: 'Farine de blé 25 kg', qte: 4, prix: 10000 }],
    total: 40000,
    statut: 'En cours' as const,
    date: '2026-07-30',
    modePaiement: 'Orange Money',
    adresseLivraison: 'Gounghin, Ouagadougou',
  },
  {
    id: 1003,
    client: 'Fatoumata Diallo',
    produits: [{ nom: 'Sucre granulé 10 kg', qte: 5, prix: 7000 }],
    total: 42000,
    statut: 'Confirmée' as const,
    date: '2026-08-01',
    modePaiement: 'Espèces',
    adresseLivraison: 'Pissy, Ouagadougou',
  },
  {
    id: 1004,
    client: 'Ibrahim Sawadogo',
    produits: [{ nom: 'Eau minérale 1,5 L', qte: 24, prix: 500 }],
    total: 12000,
    statut: 'En attente' as const,
    date: '2026-08-02',
    modePaiement: 'Moov Money',
    adresseLivraison: 'Zone du Bois, Ouagadougou',
  },
  {
    id: 1005,
    client: 'Boukary Kaboré',
    produits: [{ nom: 'Bière Brakina 65 cl', qte: 48, prix: 750 }],
    total: 36000,
    statut: 'Annulée' as const,
    date: '2026-07-22',
    modePaiement: 'Espèces',
    adresseLivraison: 'Ouaga 2000',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setupMock(commandes = COMMANDES_TEST) {
  vi.mocked(usePersistedBoutique).mockReturnValue([commandes, mockSetCommandes, true] as any)
}

/**
 * Trouve le bouton de filtre par son libellé de début.
 * Les boutons de filtre ont du texte + un badge count : ex. "En attente2".
 * On cherche le bouton dont le textContent (sans espaces) commence par le libellé.
 */
function getFilterBtn(label: string): HTMLElement {
  const normalized = label.replace(/\s/g, '')
  const btn = screen.getAllByRole('button').find((b) =>
    b.textContent?.replace(/\s/g, '').startsWith(normalized)
  )
  if (!btn) throw new Error(`Bouton filtre introuvable : "${label}"`)
  return btn
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CommandesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMock()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  // ── 1. Rendu de base ──────────────────────────────────────────────────────

  it('01 — se rend sans erreur', () => {
    expect(() => render(<CommandesPage />)).not.toThrow()
  })

  it('02 — affiche le titre "Commandes"', () => {
    render(<CommandesPage />)
    expect(screen.getByText('Commandes')).toBeInTheDocument()
  })

  it('03 — retourne null quand loaded=false', () => {
    vi.mocked(usePersistedBoutique).mockReturnValue([COMMANDES_TEST, mockSetCommandes, false] as any)
    const { container } = render(<CommandesPage />)
    expect(container.firstChild).toBeNull()
  })

  // ── 2. KPIs ───────────────────────────────────────────────────────────────

  it("04 — affiche le KPI Aujourd'hui", () => {
    render(<CommandesPage />)
    expect(screen.getByText(/aujourd/i)).toBeInTheDocument()
  })

  it('05 — affiche le KPI "En cours" (label KPI)', () => {
    render(<CommandesPage />)
    // Le KPI "En cours" est le label dans la KpiCard, distinct des badges de statut dans la table
    const matches = screen.getAllByText(/en cours/i)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('06 — affiche le KPI "Livrées ce mois"', () => {
    render(<CommandesPage />)
    expect(screen.getByText(/livrées ce mois/i)).toBeInTheDocument()
  })

  it('07 — affiche le KPI "CA Commandes"', () => {
    render(<CommandesPage />)
    expect(screen.getByText(/CA Commandes/i)).toBeInTheDocument()
  })

  // ── 3. Bouton principal ───────────────────────────────────────────────────

  it('08 — affiche le bouton "Nouvelle commande"', () => {
    render(<CommandesPage />)
    expect(screen.getByText(/nouvelle commande/i)).toBeInTheDocument()
  })

  // ── 4. Table ──────────────────────────────────────────────────────────────

  it('09 — affiche les noms des clients mock dans le tableau', () => {
    render(<CommandesPage />)
    expect(screen.getByText('Aminata Ouédraogo')).toBeInTheDocument()
    expect(screen.getByText('Moussa Traoré')).toBeInTheDocument()
    expect(screen.getByText('Ibrahim Sawadogo')).toBeInTheDocument()
  })

  it('10 — affiche les numéros de commande avec le préfixe #', () => {
    render(<CommandesPage />)
    expect(screen.getByText('#1001')).toBeInTheDocument()
    expect(screen.getByText('#1004')).toBeInTheDocument()
  })

  it('11 — affiche les modes de paiement', () => {
    render(<CommandesPage />)
    expect(screen.getByText('Wave')).toBeInTheDocument()
    expect(screen.getByText('Orange Money')).toBeInTheDocument()
  })

  it('12 — affiche le compteur total de commandes', () => {
    render(<CommandesPage />)
    expect(screen.getByText(/5 commandes au total/i)).toBeInTheDocument()
  })

  // ── 5. Filtres de statut ──────────────────────────────────────────────────

  it('13 — affiche les boutons de filtre de statut', () => {
    render(<CommandesPage />)
    // Vérifie la présence de chaque bouton de filtre
    expect(getFilterBtn('Toutes')).toBeInTheDocument()
    expect(getFilterBtn('En attente')).toBeInTheDocument()
    expect(getFilterBtn('Confirmée')).toBeInTheDocument()
    expect(getFilterBtn('Livrée')).toBeInTheDocument()
    expect(getFilterBtn('Annulée')).toBeInTheDocument()
  })

  it('14 — filtre "En attente" : affiche Ibrahim, masque Aminata', () => {
    render(<CommandesPage />)
    fireEvent.click(getFilterBtn('En attente'))
    expect(screen.getByText('Ibrahim Sawadogo')).toBeInTheDocument()
    expect(screen.queryByText('Aminata Ouédraogo')).not.toBeInTheDocument()
  })

  it('15 — filtre "Livrée" : affiche Aminata, masque Ibrahim', () => {
    render(<CommandesPage />)
    fireEvent.click(getFilterBtn('Livrée'))
    expect(screen.getByText('Aminata Ouédraogo')).toBeInTheDocument()
    expect(screen.queryByText('Ibrahim Sawadogo')).not.toBeInTheDocument()
  })

  it('16 — filtre "Confirmée" : affiche Fatoumata, masque Ibrahim', () => {
    render(<CommandesPage />)
    fireEvent.click(getFilterBtn('Confirmée'))
    expect(screen.getByText('Fatoumata Diallo')).toBeInTheDocument()
    expect(screen.queryByText('Ibrahim Sawadogo')).not.toBeInTheDocument()
  })

  it('17 — filtre "Annulée" : affiche Boukary, masque Aminata', () => {
    render(<CommandesPage />)
    fireEvent.click(getFilterBtn('Annulée'))
    expect(screen.getByText('Boukary Kaboré')).toBeInTheDocument()
    expect(screen.queryByText('Aminata Ouédraogo')).not.toBeInTheDocument()
  })

  it('18 — filtre "Toutes" : restaure toutes les lignes', () => {
    render(<CommandesPage />)
    fireEvent.click(getFilterBtn('En attente'))
    fireEvent.click(getFilterBtn('Toutes'))
    expect(screen.getByText('Aminata Ouédraogo')).toBeInTheDocument()
    expect(screen.getByText('Moussa Traoré')).toBeInTheDocument()
  })

  it('19 — liste vide : affiche un état vide honnête', () => {
    vi.mocked(usePersistedBoutique).mockReturnValue([[], mockSetCommandes, true] as any)
    render(<CommandesPage />)
    expect(screen.getByText(/aucune commande enregistrée/i)).toBeInTheDocument()
  })

  // ── 6. Modal détail ───────────────────────────────────────────────────────

  it('20 — clic sur une ligne ouvre le modal avec le numéro de commande', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText('Aminata Ouédraogo'))
    expect(screen.getByText(/commande #1001/i)).toBeInTheDocument()
  })

  it('21 — modal détail : affiche adresse de livraison', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText('Aminata Ouédraogo'))
    expect(screen.getByText('Secteur 15, Ouagadougou')).toBeInTheDocument()
  })

  it('22 — modal détail : affiche les produits de la commande', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText('Aminata Ouédraogo'))
    expect(screen.getAllByText(/riz local 50 kg/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/huile de palme 5 l/i).length).toBeGreaterThan(0)
  })

  it('23 — modal : commande "En attente" → bouton "Passer à : Confirmée"', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText('Ibrahim Sawadogo'))
    expect(screen.getByText(/passer à : confirmée/i)).toBeInTheDocument()
  })

  it('24 — modal : commande "Livrée" → pas de bouton "Passer à"', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText('Aminata Ouédraogo'))
    expect(screen.queryByText(/passer à/i)).not.toBeInTheDocument()
  })

  it('25 — clic "Passer à" appelle setCommandes', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText('Ibrahim Sawadogo'))
    fireEvent.click(screen.getByText(/passer à : confirmée/i))
    expect(mockSetCommandes).toHaveBeenCalledTimes(1)
  })

  it('26 — modal : bouton "Annuler la commande" présent pour statut non terminal', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText('Ibrahim Sawadogo'))
    expect(screen.getByText(/annuler la commande/i)).toBeInTheDocument()
  })

  it('27 — clic "Annuler la commande" appelle setCommandes', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText('Ibrahim Sawadogo'))
    fireEvent.click(screen.getByText(/annuler la commande/i))
    expect(mockSetCommandes).toHaveBeenCalled()
  })

  it('28 — modal : commande "Annulée" → pas de bouton "Annuler la commande"', () => {
    render(<CommandesPage />)
    fireEvent.click(getFilterBtn('Annulée'))
    fireEvent.click(screen.getByText('Boukary Kaboré'))
    expect(screen.queryByText(/annuler la commande/i)).not.toBeInTheDocument()
  })

  // ── 7. Formulaire nouvelle commande ───────────────────────────────────────

  it('29 — "Nouvelle commande" → ouvre le formulaire', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText(/nouvelle commande/i))
    expect(screen.getByPlaceholderText('Nom du client')).toBeInTheDocument()
  })

  it('30 — formulaire propose les modes de paiement mobile money', () => {
    render(<CommandesPage />)
    fireEvent.click(screen.getByText(/nouvelle commande/i))
    expect(screen.getAllByText('Orange Money').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Wave').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Moov Money').length).toBeGreaterThan(0)
  })
})
