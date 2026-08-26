import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/use-auth'
import { NAV_ITEMS } from './nav-items'
import type { Page } from '@/Dashboard'

export function Sidebar({
  active,
  onNavigate,
}: {
  active: Page
  onNavigate: (page: Page) => void
}) {
  const { user, logout } = useAuth()
  const visibleItems = NAV_ITEMS.filter((item) => user && item.tipos.includes(user.tipo_usuario))

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-4 border-r border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2 px-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-destructive"
          title="Sair"
          onClick={logout}
        >
          <LogOut />
        </Button>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto">
        {visibleItems.map(({ page, label, icon: Icon }) => (
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
    </aside>
  )
}
