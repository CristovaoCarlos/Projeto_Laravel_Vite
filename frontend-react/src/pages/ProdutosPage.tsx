import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ApiError, deleteProduto, listProdutos, type Produto } from '@/lib/api'
import { normalize } from '@/lib/format'
import { ProdutoForm } from './ProdutoForm'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function matchesSearch(produto: Produto, term: string): boolean {
  const trimmed = normalize(term.trim())
  if (!trimmed) return true

  const descriptionMatch = normalize(produto.description).includes(trimmed)
  const idMatch = String(produto.id).includes(trimmed)

  return descriptionMatch || idMatch
}

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Produto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const isFormOpen = isCreating || editing !== null
  const filteredProdutos = produtos.filter((produto) => matchesSearch(produto, search))

  function loadProdutos() {
    return listProdutos().then(setProdutos)
  }

  useEffect(() => {
    loadProdutos().finally(() => setIsLoadingList(false))
  }, [])

  function closeForm() {
    setIsCreating(false)
    setEditing(null)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteProduto(deleteTarget.id)
      if (editing?.id === deleteTarget.id) setEditing(null)
      setDeleteTarget(null)
      loadProdutos()
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Não foi possível excluir o produto.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isFormOpen && (
        <ProdutoForm
          produto={editing}
          onSaved={() => {
            closeForm()
            loadProdutos()
          }}
          onCancel={closeForm}
        />
      )}

      {!isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos cadastrados</CardTitle>
            <CardAction>
              <Button size="sm" onClick={() => setIsCreating(true)}>
                Novo Produto
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Buscar por ID ou descrição"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setSearch(searchInput)
                  }
                }}
              />
              <div className="flex gap-2">
                <Button type="button" className="flex-1 sm:flex-initial" onClick={() => setSearch(searchInput)}>
                  <Search />
                  Buscar
                </Button>
                {search && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 sm:flex-initial"
                    onClick={() => {
                      setSearchInput('')
                      setSearch('')
                    }}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {isLoadingList ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : produtos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
            ) : filteredProdutos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum produto encontrado para "{search}".</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-2 font-medium">Descrição</th>
                      <th className="py-2 pr-2 font-medium">Preço</th>
                      <th className="py-2 pr-2 font-medium">Estoque</th>
                      <th className="py-2 pr-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProdutos.map((produto) => (
                      <tr key={produto.id} className="border-b last:border-0">
                        <td className="py-2 pr-2">{produto.description}</td>
                        <td className="py-2 pr-2">{currency.format(Number(produto.price))}</td>
                        <td className="py-2 pr-2">{produto.stock}</td>
                        <td className="py-2 pr-2 whitespace-nowrap">
                          <Button size="sm" variant="outline" onClick={() => setEditing(produto)}>
                            Editar
                          </Button>{' '}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeleteTarget(produto)
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
        title="Excluir produto"
        description={`Tem certeza que deseja excluir o produto "${deleteTarget?.description}"? Essa ação não pode ser desfeita.`}
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
