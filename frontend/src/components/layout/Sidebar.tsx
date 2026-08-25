import { Briefcase, History, LogOut, Package, ShoppingCart, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/use-auth'
import type { Page } from '@/Dashboard'

const NAV_ITEMS: { page: Page; label: string; icon: typeof Users }[] = [
  { page: 'clientes', label: 'Clientes', icon: Users },
  { page: 'produtos', label: 'Produtos', icon: Package },
  { page: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
  { page: 'vendedores', label: 'Vendedores', icon: Briefcase },
  { page: 'historico', label: 'Lançar Histórico', icon: History },
]

export function Sidebar({
  active,
  onNavigate,
}: {
  active: Page
  onNavigate: (page: Page) => void
}) {
  const { user, logout } = useAuth()

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-4 border-r border-border bg-card p-4">
      <div className="px-2">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
          <Button
            key={page}
            variant={active === page ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => onNavigate(page)}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </nav>

      <Button variant="ghost" className="mt-auto justify-start text-destructive" onClick={logout}>
        <LogOut />
        Sair
      </Button>
    </aside>
  )
}
