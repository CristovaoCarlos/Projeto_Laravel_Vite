import { Briefcase, History, Package, Shield, ShoppingCart, Users } from 'lucide-react'
import type { TipoUsuario } from '@/lib/api'
import type { Page } from '@/Dashboard'

export const NAV_ITEMS: { page: Page; label: string; icon: typeof Users; tipos: TipoUsuario[] }[] = [
  { page: 'clientes', label: 'Clientes', icon: Users, tipos: ['superadmin', 'vendedor'] },
  { page: 'produtos', label: 'Produtos', icon: Package, tipos: ['superadmin', 'estoquista'] },
  { page: 'pedidos', label: 'Pedidos', icon: ShoppingCart, tipos: ['superadmin', 'vendedor'] },
  { page: 'vendedores', label: 'Vendedores', icon: Briefcase, tipos: ['superadmin'] },
  { page: 'historico', label: 'Lançar Histórico', icon: History, tipos: ['superadmin', 'historico'] },
  { page: 'usuarios', label: 'Usuários', icon: Shield, tipos: ['superadmin'] },
]
