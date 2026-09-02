import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import { useAuth } from '@/lib/use-auth'
import { ClientesPage } from '@/pages/ClientesPage'
import { ProdutosPage } from '@/pages/ProdutosPage'
import { PedidosPage } from '@/pages/PedidosPage'
import { VendedoresPage } from '@/pages/VendedoresPage'
import { LancarHistoricoPage } from '@/pages/LancarHistoricoPage'
import { UsuariosPage } from '@/pages/UsuariosPage'

export type Page = 'clientes' | 'produtos' | 'pedidos' | 'vendedores' | 'historico' | 'usuarios'

export function Dashboard() {
  const { user } = useAuth()
  const allowedPages = NAV_ITEMS.filter((item) => user && item.tipos.includes(user.tipo_usuario)).map(
    (item) => item.page,
  )
  const [requestedActive, setRequestedActive] = useState<Page>('clientes')
  const active = allowedPages.includes(requestedActive) ? requestedActive : (allowedPages[0] ?? requestedActive)
  const [pedidoClienteId, setPedidoClienteId] = useState<number | null>(null)

  function handleNavigate(page: Page) {
    setPedidoClienteId(null)
    setRequestedActive(page)
  }

  return (
    <DashboardLayout active={active} onNavigate={handleNavigate}>
      {active === 'clientes' && (
        <ClientesPage
          onNewPedido={(clienteId) => {
            setPedidoClienteId(clienteId)
            setRequestedActive('pedidos')
          }}
        />
      )}
      {active === 'produtos' && <ProdutosPage />}
      {active === 'pedidos' && (
        <PedidosPage initialClienteId={pedidoClienteId} onConsumeInitialClienteId={() => setPedidoClienteId(null)} />
      )}
      {active === 'vendedores' && <VendedoresPage />}
      {active === 'historico' && <LancarHistoricoPage />}
      {active === 'usuarios' && <UsuariosPage />}
    </DashboardLayout>
  )
}
