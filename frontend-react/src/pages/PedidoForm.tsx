import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ApiError,
  comprovanteUrl,
  createPedido,
  updatePedido,
  type Cliente,
  type Pedido,
  type Vendedor,
  type PedidoStatus,
  type Produto,
  type TipoPagamento,
} from '@/lib/api'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const TIPOS_PAGAMENTO: { value: TipoPagamento; label: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'pix', label: 'Pix' },
]

const STATUS_PEDIDO: { value: PedidoStatus; label: string }[] = [
  { value: 'aguardando_pagamento', label: 'Aguardando pagamento' },
  { value: 'pagamento_efetuado', label: 'Pagamento efetuado' },
]

type ItemForm = { produto_id: number; quantidade: number }

export function PedidoForm({
  pedido,
  vendedores,
  clientes,
  produtos,
  initialClienteId,
  onSaved,
  onCancel,
}: {
  pedido: Pedido | null
  vendedores: Vendedor[]
  clientes: Cliente[]
  produtos: Produto[]
  initialClienteId?: number
  onSaved: () => void
  onCancel?: () => void
}) {
  const [clienteId, setClienteId] = useState(
    pedido ? String(pedido.cliente_id) : initialClienteId ? String(initialClienteId) : ''
  )
  const [vendedorId, setVendedorId] = useState(
    pedido?.vendedor_id ? String(pedido.vendedor_id) : ''
  )
  useEffect(()=> {
    if(pedido) return
    const cliente = clientes.find((c)=> c.id === Number(clienteId))
    setVendedorId(cliente?.vendedor_id ? String(cliente.vendedor_id): '')
  } , [clienteId, clientes, pedido])
  const [tipoPagamento, setTipoPagamento] = useState<TipoPagamento>(pedido?.tipo_pagamento ?? 'dinheiro')
  const [status, setStatus] = useState<PedidoStatus>(pedido?.status ?? 'aguardando_pagamento')
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [itens, setItens] = useState<ItemForm[]>(
    pedido ? (pedido.itens ?? []).map((item) => ({ produto_id: item.produto_id, quantidade: item.quantidade })) : []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addItem() {
    setItens((prev) => [...prev, { produto_id: produtos[0]?.id ?? 0, quantidade: 1 }])
  }

  function updateItem(index: number, changes: Partial<ItemForm>) {
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, ...changes } : item)))
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  function handleComprovanteChange(event: ChangeEvent<HTMLInputElement>) {
    setComprovante(event.target.files?.[0] ?? null)
  }

  const total = itens.reduce((sum, item) => {
    const produto = produtos.find((p) => p.id === item.produto_id)
    return sum + (produto ? Number(produto.price) * item.quantidade : 0)
  }, 0)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!clienteId) {
      setError('Selecione um cliente.')
      return
    }
    if (itens.length === 0) {
      setError('Adicione ao menos um item ao pedido.')
      return
    }

    setIsSubmitting(true)
    const data = {
      cliente_id: Number(clienteId),
      vendedor_id: Number(vendedorId),
      tipo_pagamento: tipoPagamento,
      status,
      comprovante_pagamento: comprovante,
      itens,
    }

    try {
      if (pedido) {
        await updatePedido(pedido.id, data)
      } else {
        await createPedido(data)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível conectar à API.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{pedido ? `Editar pedido #${pedido.id}` : 'Registrar pedido'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="cliente_id" className="text-sm font-medium">
              Cliente
            </label>
            <select
              id="cliente_id"
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
          <label htmlFor="vendedor_id" className="text-sm font-medium">
            Vendedor
          </label>
          <select
            id="vendedor_id"
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
            value={vendedorId}
            onChange={(e) => setVendedorId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {vendedores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </select>
        </div>

          

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="tipo_pagamento" className="text-sm font-medium">
                Tipo de pagamento
              </label>
              <select
                id="tipo_pagamento"
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
                value={tipoPagamento}
                onChange={(e) => setTipoPagamento(e.target.value as TipoPagamento)}
              >
                {TIPOS_PAGAMENTO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as PedidoStatus)}
              >
                {STATUS_PEDIDO.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="comprovante_pagamento" className="text-sm font-medium">
              Comprovante de pagamento
            </label>
            <Input
              id="comprovante_pagamento"
              name="comprovante_pagamento"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleComprovanteChange}
            />
            {pedido?.comprovante_pagamento && (
              <a
                href={comprovanteUrl(pedido.comprovante_pagamento)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                Ver comprovante atual
              </a>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Itens</span>
            {itens.map((item, index) => {
              const produto = produtos.find((p) => p.id === item.produto_id)
              return (
                <div key={index} className="flex flex-col gap-2 rounded-lg border border-border p-2 sm:flex-row sm:items-center sm:border-0 sm:p-0">
                  <select
                    className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm sm:flex-1"
                    value={item.produto_id}
                    onChange={(e) => updateItem(index, { produto_id: Number(e.target.value) })}
                  >
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.description} (estoque: {p.stock})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      className="w-24"
                      value={item.quantidade}
                      onChange={(e) => updateItem(index, { quantidade: Number(e.target.value) })}
                    />
                    <span className="w-24 text-right text-sm text-muted-foreground">
                      {produto ? currency.format(Number(produto.price) * item.quantidade) : '—'}
                    </span>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(index)}>
                      Remover
                    </Button>
                  </div>
                </div>
              )
            })}
            <Button type="button" size="sm" variant="outline" onClick={addItem} disabled={produtos.length === 0}>
              Adicionar item
            </Button>
          </div>

          <p className="text-right text-sm font-medium">Total: {currency.format(total)}</p>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : pedido ? 'Salvar alterações' : 'Registrar pedido'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
