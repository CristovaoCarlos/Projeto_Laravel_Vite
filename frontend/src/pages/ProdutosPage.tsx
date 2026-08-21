import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ApiError,
  createProduto,
  deleteProduto,
  listProdutos,
  updateProduto,
  type Produto,
} from '@/lib/api'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  function loadProdutos() {
    return listProdutos().then(setProdutos)
  }

  useEffect(() => {
    loadProdutos().finally(() => setIsLoadingList(false))
  }, [])

  function resetForm() {
    setEditing(null)
    setError(null)
    setFieldErrors({})
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: String(formData.get('name') ?? ''),
      description: (formData.get('description') as string) || null,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
    }

    try {
      if (editing) {
        await updateProduto(editing.id, data)
      } else {
        await createProduto(data)
      }
      resetForm()
      loadProdutos()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.errors ?? {})
      } else {
        setError('Não foi possível conectar à API.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(produto: Produto) {
    if (!confirm(`Excluir o produto "${produto.name}"?`)) return
    try {
      await deleteProduto(produto.id)
      if (editing?.id === produto.id) resetForm()
      loadProdutos()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Não foi possível excluir o produto.')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? `Editar produto: ${editing.name}` : 'Cadastrar produto'}</CardTitle>
        </CardHeader>
        <form key={editing?.id ?? 'new'} onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label htmlFor="name" className="text-sm font-medium">
                Nome
              </label>
              <Input id="name" name="name" required defaultValue={editing?.name} />
              {fieldErrors.name?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição
              </label>
              <Input id="description" name="description" defaultValue={editing?.description ?? ''} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="price" className="text-sm font-medium">
                Preço
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={editing?.price}
              />
              {fieldErrors.price?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="stock" className="text-sm font-medium">
                Estoque
              </label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                required
                defaultValue={editing?.stock}
              />
              {fieldErrors.stock?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            {error && <p className="col-span-2 text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar'}
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
          <CardTitle>Produtos cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : produtos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">Nome</th>
                    <th className="py-2 pr-2 font-medium">Descrição</th>
                    <th className="py-2 pr-2 font-medium">Preço</th>
                    <th className="py-2 pr-2 font-medium">Estoque</th>
                    <th className="py-2 pr-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id} className="border-b last:border-0">
                      <td className="py-2 pr-2">{produto.name}</td>
                      <td className="py-2 pr-2">{produto.description ?? '—'}</td>
                      <td className="py-2 pr-2">{currency.format(Number(produto.price))}</td>
                      <td className="py-2 pr-2">{produto.stock}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => setEditing(produto)}>
                          Editar
                        </Button>{' '}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(produto)}>
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
