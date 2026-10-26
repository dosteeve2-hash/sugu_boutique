import {
  LayoutDashboard,
  Calculator,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  BarChart3,
  FileText,
  Settings,
  History,
  type LucideIcon,
} from 'lucide-react'
import type { Traduction } from '@/lib/i18n'

export type NavItem = {
  href: string
  icon: LucideIcon
  label: (t: Traduction) => string
}

export const NAV_ACCUEIL: NavItem = { href: '/app', icon: LayoutDashboard, label: (t) => t.accueil }
export const NAV_CAISSE: NavItem = { href: '/caisse', icon: Calculator, label: (t) => t.caisse }
export const NAV_PRODUITS: NavItem = { href: '/produits', icon: Package, label: (t) => t.produits }
export const NAV_CLIENTS: NavItem = { href: '/clients', icon: Users, label: (t) => t.clients }

export const NAV_AUTRES: NavItem[] = [
  { href: '/ventes', icon: ShoppingCart, label: (t) => t.ventes },
  { href: '/stock', icon: BarChart3, label: (t) => t.stock },
  { href: '/achats', icon: Truck, label: (t) => t.achats },
  { href: '/fournisseurs', icon: Building2, label: (t) => t.fournisseurs },
  { href: '/rapports', icon: FileText, label: (t) => t.rapports },
  { href: '/historique', icon: History, label: () => 'Historique' },
  { href: '/parametres', icon: Settings, label: (t) => t.parametres },
]

export const NAV_TOUS: NavItem[] = [NAV_ACCUEIL, NAV_CAISSE, NAV_PRODUITS, NAV_CLIENTS, ...NAV_AUTRES]
