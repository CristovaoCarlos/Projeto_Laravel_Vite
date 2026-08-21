import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ApiError,
  createVenda,
  deleteVenda,
  listClientes,
  listProdutos,
  listVendas,
  updateVenda,
  type Cliente,
  type Produto,
  type Venda,
} from '@/lib/api'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

type ItemForm = { produto_id: number; quantidade: number }

export function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [editing, setEditing] = useState<Venda | null>(null)
  const [clienteId, setClienteId] = useState('')
  const [itens, setItens] = useState<ItemForm[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function loadAll() {
    return Promise.all([listVendas(), listClientes(), listProdutos()]).then(([v, c, p]) => {
      setVendas(v)
      setClientes(c)
      setProdutos(p)
    })
  }

  useEffect(() => {
    loadAll().finally(() => setIsLoadingList(false))
  }, [])

  function resetForm() {
    setEditing(null)
    setClienteId('')
    setItens([])
    setError(null)
  }

  function startEdit(venda: Venda) {
    setEditing(venda)
    setClienteId(String(venda.cliente_id))
    setItens((venda.itens ?? []).map((item) => ({ produto_id: item.produto_id, quantidade: item.quantidade })))
    setError(null)
  }

  function addItem() {
    setItens((prev) => [...prev, { produto_id: produtos[0]?.id ?? 0, quantidade: 1 }])
  }

  function updateItem(index: number, changes: Partial<ItemForm>) {
    setItens((prev) => prev.map((item, i) => (i === index ? { ...item, ...changes } : item)))
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index))
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
      setError('Adicione ao menos um item à venda.')
      return
    }

    setIsSubmitting(true)
    const data = { cliente_id: Number(clienteId), itens }

    try {
      if (editing) {
        await updateVenda(editing.id, data)
      } else {
        await createVenda(data)
      }
      resetForm()
      loadAll()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível conectar à API.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(venda: Venda) {
    if (!confirm(`Excluir a venda #${venda.id}?`)) return
    await deleteVenda(venda.id)
    if (editing?.id === venda.id) resetForm()
    loadAll()
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? `Editar venda #${editing.id}` : 'Registrar venda'}</CardTitle>
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

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Itens</span>
              {itens.map((item, index) => {
                const produto = produtos.find((p) => p.id === item.produto_id)
                return (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      className="h-8 flex-1 rounded-lg border border-border bg-background px-2.5 text-sm"
                      value={item.produto_id}
                      onChange={(e) => updateItem(index, { produto_id: Number(e.target.value) })}
                    >
                      {produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (estoque: {p.stock})
                        </option>
                      ))}
                    </select>
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
              {isSubmitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Registrar venda'}
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendas realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : vendas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma venda registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">#</th>
                    <th className="py-2 pr-2 font-medium">Cliente</th>
                    <th className="py-2 pr-2 font-medium">Itens</th>
                    <th className="py-2 pr-2 font-medium">Total</th>
                    <th className="py-2 pr-2 font-medium">Data</th>
                    <th className="py-2 pr-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda) => (
                    <tr key={venda.id} className="border-b last:border-0">
                      <td className="py-2 pr-2">{venda.id}</td>
                      <td className="py-2 pr-2">{venda.cliente?.name ?? '—'}</td>
                      <td className="py-2 pr-2">{venda.itens?.length ?? 0}</td>
                      <td className="py-2 pr-2">{currency.format(Number(venda.total))}</td>
                      <td className="py-2 pr-2">{dateFormat.format(new Date(venda.created_at))}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => startEdit(venda)}>
                          Editar
                        </Button>{' '}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(venda)}>
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
    </div>
  )
}
