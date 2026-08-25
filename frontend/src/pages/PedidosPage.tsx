import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  ApiError,
  comprovanteUrl,
  deletePedido,
  listClientes,
  listPedidos,
  listProdutos,
  type Cliente,
  type Pedido,
  type PedidoStatus,
  type Produto,
  type TipoPagamento,
} from '@/lib/api'
import { PedidoForm } from './PedidoForm'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const TIPO_PAGAMENTO_LABELS: Record<TipoPagamento, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'Pix',
}

const STATUS_LABELS: Record<PedidoStatus, string> = {
  aguardando_pagamento: 'Aguardando pagamento',
  pagamento_efetuado: 'Pagamento efetuado',
}

export function PedidosPage({
  initialClienteId,
  onConsumeInitialClienteId,
}: {
  initialClienteId?: number | null
  onConsumeInitialClienteId?: () => void
}) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [editing, setEditing] = useState<Pedido | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Pedido | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isFormOpen = isCreating || editing !== null || initialClienteId != null

  function loadAll() {
    return Promise.all([listPedidos(), listClientes(), listProdutos()]).then(([v, c, p]) => {
      setPedidos(v)
      setClientes(c)
      setProdutos(p)
    })
  }

  useEffect(() => {
    loadAll().finally(() => setIsLoadingList(false))
  }, [])

  function closeForm() {
    setIsCreating(false)
    setEditing(null)
    onConsumeInitialClienteId?.()
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deletePedido(deleteTarget.id)
      if (editing?.id === deleteTarget.id) setEditing(null)
      setDeleteTarget(null)
      loadAll()
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Não foi possível excluir o pedido.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isFormOpen && (
        <PedidoForm
          pedido={editing}
          clientes={clientes}
          produtos={produtos}
          initialClienteId={editing ? undefined : (initialClienteId ?? undefined)}
          onSaved={() => {
            closeForm()
            loadAll()
          }}
          onCancel={closeForm}
        />
      )}

      {!isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Pedidos realizados</CardTitle>
            <CardAction>
              <Button size="sm" onClick={() => setIsCreating(true)}>
                Novo Pedido
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {isLoadingList ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : pedidos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pedido registrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-2 font-medium">#</th>
                      <th className="py-2 pr-2 font-medium">Cliente</th>
                      <th className="py-2 pr-2 font-medium">Itens</th>
                      <th className="py-2 pr-2 font-medium">Pagamento</th>
                      <th className="py-2 pr-2 font-medium">Status</th>
                      <th className="py-2 pr-2 font-medium">Comprovante</th>
                      <th className="py-2 pr-2 font-medium">Total</th>
                      <th className="py-2 pr-2 font-medium">Data</th>
                      <th className="py-2 pr-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((pedido) => (
                      <tr key={pedido.id} className="border-b last:border-0">
                        <td className="py-2 pr-2">{pedido.id}</td>
                        <td className="py-2 pr-2">{pedido.cliente?.name ?? '—'}</td>
                        <td className="py-2 pr-2">{pedido.itens?.length ?? 0}</td>
                        <td className="py-2 pr-2">{TIPO_PAGAMENTO_LABELS[pedido.tipo_pagamento]}</td>
                        <td className="py-2 pr-2">{STATUS_LABELS[pedido.status]}</td>
                        <td className="py-2 pr-2">
                          {pedido.comprovante_pagamento ? (
                            <a
                              href={comprovanteUrl(pedido.comprovante_pagamento)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              Ver
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2 pr-2">{currency.format(Number(pedido.total))}</td>
                        <td className="py-2 pr-2">{dateFormat.format(new Date(pedido.created_at))}</td>
                        <td className="py-2 pr-2 whitespace-nowrap">
                          <Button size="sm" variant="outline" onClick={() => setEditing(pedido)}>
                            Editar
                          </Button>{' '}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeleteTarget(pedido)
                              setDeleteError(null)
                            }}
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
        title="Excluir pedido"
        description={`Tem certeza que deseja excluir o pedido #${deleteTarget?.id}? O estoque dos produtos será restaurado. Essa ação não pode ser desfeita.`}
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
