import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from './Sidebar'
import type { Page } from '@/Dashboard'

export function DashboardLayout({
  active,
  onNavigate,
  children,
}: {
  active: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  function handleNavigate(page: Page) {
    setIsSidebarOpen(false)
    onNavigate(page)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        active={active}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-card p-3 md:hidden">
          <Button variant="ghost" size="icon" title="Abrir menu" onClick={() => setIsSidebarOpen(true)}>
            <Menu />
          </Button>
          <span className="text-sm font-medium">Menu</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
