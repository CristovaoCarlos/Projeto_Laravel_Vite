import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ClientesPage } from '@/pages/ClientesPage'
import { ProdutosPage } from '@/pages/ProdutosPage'
import { PedidosPage } from '@/pages/PedidosPage'
import { VendedoresPage } from '@/pages/VendedoresPage'
import { LancarHistoricoPage } from '@/pages/LancarHistoricoPage'

export type Page = 'clientes' | 'produtos' | 'pedidos' | 'vendedores' | 'historico'

export function Dashboard() {
  const [active, setActive] = useState<Page>('clientes')
  const [pedidoClienteId, setPedidoClienteId] = useState<number | null>(null)

  function handleNavigate(page: Page) {
    setPedidoClienteId(null)
    setActive(page)
  }

  return (
    <DashboardLayout active={active} onNavigate={handleNavigate}>
      {active === 'clientes' && (
        <ClientesPage
          onNewPedido={(clienteId) => {
            setPedidoClienteId(clienteId)
            setActive('pedidos')
          }}
        />
      )}
      {active === 'produtos' && <ProdutosPage />}
      {active === 'pedidos' && (
        <PedidosPage initialClienteId={pedidoClienteId} onConsumeInitialClienteId={() => setPedidoClienteId(null)} />
      )}
      {active === 'vendedores' && <VendedoresPage />}
      {active === 'historico' && <LancarHistoricoPage />}
    </DashboardLayout>
  )
}
