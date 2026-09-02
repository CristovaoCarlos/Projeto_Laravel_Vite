import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ApiError, deleteVendedor, listVendedores, type Vendedor } from '@/lib/api'
import { VendedorForm } from './VendedorForm'

export function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [editing, setEditing] = useState<Vendedor | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Vendedor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isFormOpen = isCreating || editing !== null

  function loadVendedores() {
    return listVendedores().then(setVendedores)
  }

  useEffect(() => {
    loadVendedores().finally(() => setIsLoadingList(false))
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
      await deleteVendedor(deleteTarget.id)
      if (editing?.id === deleteTarget.id) setEditing(null)
      setDeleteTarget(null)
      loadVendedores()
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Não foi possível excluir o vendedor.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isFormOpen && (
        <VendedorForm
          vendedor={editing}
          onSaved={() => {
            closeForm()
            loadVendedores()
          }}
          onCancel={closeForm}
        />
      )}

      {!isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Vendedores cadastrados</CardTitle>
            <CardAction>
              <Button size="sm" onClick={() => setIsCreating(true)}>
                Novo Vendedor
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {isLoadingList ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : vendedores.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum vendedor cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-2 font-medium">ID</th>
                      <th className="py-2 pr-2 font-medium">Nome</th>
                      <th className="py-2 pr-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {vendedores.map((vendedor) => (
                      <tr key={vendedor.id} className="border-b last:border-0">
                        <td className="py-2 pr-2 text-muted-foreground">{vendedor.id}</td>
                        <td className="py-2 pr-2">{vendedor.nome}</td>
                        <td className="py-2 pr-2 whitespace-nowrap">
                          <Button size="sm" variant="outline" onClick={() => setEditing(vendedor)}>
                            Editar
                          </Button>{' '}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeleteTarget(vendedor)
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
        title="Excluir vendedor"
        description={`Tem certeza que deseja excluir o vendedor "${deleteTarget?.nome}"? Essa ação não pode ser desfeita.`}
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
