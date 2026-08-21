import type { ReactNode } from 'react'
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
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active={active} onNavigate={onNavigate} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
