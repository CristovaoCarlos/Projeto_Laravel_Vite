import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ApiError, deleteCliente, listClientes, listVendedores, type Cliente, type Vendedor } from '@/lib/api'
import { formatCep, formatPhone, normalize } from '@/lib/format'
import { ClienteForm } from './ClienteForm'

function matchesSearch(cliente: Cliente, term: string): boolean {
  const trimmed = normalize(term.trim())
  if (!trimmed) return true

  const digits = term.replace(/\D/g, '')
  const nameMatch = normalize(cliente.name).includes(trimmed)
  const idMatch = String(cliente.id).includes(trimmed)
  const phoneMatch = digits !== '' && cliente.phone.replace(/\D/g, '').includes(digits)

  return nameMatch || idMatch || phoneMatch
}

export function ClientesPage({ onNewPedido }: { onNewPedido?: (clienteId: number) => void }) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const isFormOpen = isCreating || editing !== null
  const filteredClientes = clientes.filter((cliente) => matchesSearch(cliente, search))

  function loadClientes() {
    return listClientes().then(setClientes)
  }

  useEffect(() => {
    Promise.all([loadClientes(), listVendedores().then(setVendedores)]).finally(() => setIsLoadingList(false))
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
      await deleteCliente(deleteTarget.id)
      if (editing?.id === deleteTarget.id) setEditing(null)
      setDeleteTarget(null)
      loadClientes()
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Não foi possível excluir o cliente.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isFormOpen && (
        <ClienteForm
          cliente={editing}
          vendedor={vendedores}
          onSaved={() => {
            closeForm()
            loadClientes()
          }}
          onCancel={closeForm}
        />
      )}

      {!isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Clientes cadastrados</CardTitle>
            <CardAction>
              <Button size="sm" onClick={() => setIsCreating(true)}>
                Novo Cliente
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por ID, nome ou telefone"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setSearch(searchInput)
                  }
                }}
              />
              <Button type="button" onClick={() => setSearch(searchInput)}>
                <Search />
                Buscar
              </Button>
              {search && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchInput('')
                    setSearch('')
                  }}
                >
                  Limpar
                </Button>
              )}
            </div>

            {isLoadingList ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : clientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
            ) : filteredClientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cliente encontrado para "{search}".</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-2 font-medium">ID</th>
                      <th className="py-2 pr-2 font-medium">Nome</th>
                      <th className="py-2 pr-2 font-medium">Telefone</th>
                      <th className="py-2 pr-2 font-medium">Email</th>
                      <th className="py-2 pr-2 font-medium">Endereço</th>
                      <th className="py-2 pr-2 font-medium">Localização</th>
                      <th className="py-2 pr-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientes.map((cliente) => (
                      <tr key={cliente.id} className="border-b last:border-0">
                        <td className="py-2 pr-2 text-muted-foreground">{cliente.id}</td>
                        <td className="py-2 pr-2">{cliente.name}</td>
                        <td className="py-2 pr-2">{formatPhone(cliente.phone)}</td>
                        <td className="py-2 pr-2">{cliente.email ?? '—'}</td>
                        <td className="py-2 pr-2">
                          {cliente.street}, {cliente.number ?? 's/n'} - {cliente.city} - {cliente.state},{' '}
                          {formatCep(cliente.zip_code)}
                        </td>
                        <td className="py-2 pr-2">
                          {cliente.location ? (
                            <a
                              href={`https://www.google.com/maps?q=${encodeURIComponent(cliente.location)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              Ver mapa
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2 pr-2 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!cliente.pedidos_count}
                            title={
                              cliente.pedidos_count
                                ? 'Cliente possui pedidos registrados — edição bloqueada'
                                : undefined
                            }
                            onClick={() => setEditing(cliente)}
                          >
                            Editar
                          </Button>{' '}
                          {onNewPedido && (
                            <Button size="sm" variant="outline" onClick={() => onNewPedido(cliente.id)}>
                              Novo Pedido
                            </Button>
                          )}{' '}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeleteTarget(cliente)
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
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir o cliente "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
