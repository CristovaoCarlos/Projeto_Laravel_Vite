import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ApiError, deleteUsuario, listUsuarios, type TipoUsuario, type User } from '@/lib/api'
import { useAuth } from '@/lib/use-auth'
import { UsuarioForm } from './UsuarioForm'

const TIPO_LABELS: Record<TipoUsuario, string> = {
  superadmin: 'Superadmin',
  vendedor: 'Vendedor',
  estoquista: 'Estoquista',
  historico: 'Histórico',
}

export function UsuariosPage() {
  const { user: currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [editing, setEditing] = useState<User | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isFormOpen = isCreating || editing !== null

  function loadUsuarios() {
    return listUsuarios().then(setUsuarios)
  }

  useEffect(() => {
    loadUsuarios().finally(() => setIsLoadingList(false))
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
      await deleteUsuario(deleteTarget.id)
      if (editing?.id === deleteTarget.id) setEditing(null)
      setDeleteTarget(null)
      loadUsuarios()
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Não foi possível excluir o usuário.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isFormOpen && (
        <UsuarioForm
          usuario={editing}
          onSaved={() => {
            closeForm()
            loadUsuarios()
          }}
          onCancel={closeForm}
        />
      )}

      {!isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Usuários cadastrados</CardTitle>
            <CardAction>
              <Button size="sm" onClick={() => setIsCreating(true)}>
                Novo Usuário
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {isLoadingList ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : usuarios.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-2 font-medium">ID</th>
                      <th className="py-2 pr-2 font-medium">Nome</th>
                      <th className="py-2 pr-2 font-medium">Email</th>
                      <th className="py-2 pr-2 font-medium">Tipo</th>
                      <th className="py-2 pr-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => {
                      const isSelf = usuario.id === currentUser?.id
                      return (
                        <tr key={usuario.id} className="border-b last:border-0">
                          <td className="py-2 pr-2 text-muted-foreground">{usuario.id}</td>
                          <td className="py-2 pr-2">
                            {usuario.name} {isSelf && <span className="text-xs text-muted-foreground">(você)</span>}
                          </td>
                          <td className="py-2 pr-2">{usuario.email}</td>
                          <td className="py-2 pr-2">{TIPO_LABELS[usuario.tipo_usuario]}</td>
                          <td className="py-2 pr-2 whitespace-nowrap">
                            <Button size="sm" variant="outline" onClick={() => setEditing(usuario)}>
                              Editar
                            </Button>{' '}
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isSelf}
                              title={isSelf ? 'Você não pode excluir seu próprio usuário' : undefined}
                              onClick={() => {
                                setDeleteTarget(usuario)
                                setDeleteError(null)
                              }}
                            >
                              Excluir
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
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
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir o usuário "${deleteTarget?.name}"? Essa ação não pode ser desfeita.`}
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
