import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ClientesPage } from '@/pages/ClientesPage'
import { ProdutosPage } from '@/pages/ProdutosPage'
import { VendasPage } from '@/pages/VendasPage'

export type Page = 'clientes' | 'produtos' | 'vendas'

export function Dashboard() {
  const [active, setActive] = useState<Page>('clientes')

  return (
    <DashboardLayout active={active} onNavigate={setActive}>
      {active === 'clientes' && <ClientesPage />}
      {active === 'produtos' && <ProdutosPage />}
      {active === 'vendas' && <VendasPage />}
    </DashboardLayout>
  )
}
