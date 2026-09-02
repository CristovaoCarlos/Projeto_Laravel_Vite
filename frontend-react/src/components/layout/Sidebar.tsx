import { LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/use-auth'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'
import type { Page } from '@/Dashboard'

export function Sidebar({
  active,
  onNavigate,
  isOpen,
  onClose,
}: {
  active: Page
  onNavigate: (page: Page) => void
  isOpen: boolean
  onClose: () => void
}) {
  const { user, logout } = useAuth()
  const visibleItems = NAV_ITEMS.filter((item) => user && item.tipos.includes(user.tipo_usuario))

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col gap-4 border-r border-border bg-card p-4 transition-transform duration-200 md:sticky md:top-0 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" className="text-destructive" title="Sair" onClick={logout}>
              <LogOut />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" title="Fechar menu" onClick={onClose}>
              <X />
            </Button>
          </div>
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
    </>
  )
}
