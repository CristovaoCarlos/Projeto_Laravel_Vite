import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ApiError,
  createCliente,
  deleteCliente,
  listClientes,
  updateCliente,
  type Cliente,
} from '@/lib/api'

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function RequiredLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 border-l-4 border-destructive pl-2 text-sm font-medium"
    >
      {children}
      <span className="text-destructive">*</span>
    </label>
  )
}

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  function loadClientes() {
    return listClientes().then(setClientes)
  }

  useEffect(() => {
    loadClientes().finally(() => setIsLoadingList(false))
  }, [])

  function resetForm() {
    setEditing(null)
    setError(null)
    setFieldErrors({})
    setFormKey((k) => k + 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      address: String(formData.get('address') ?? ''),
    }

    try {
      if (editing) {
        await updateCliente(editing.id, data)
      } else {
        await createCliente(data)
      }
      resetForm()
      loadClientes()
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

  async function handleDelete(cliente: Cliente) {
    if (!confirm(`Excluir o cliente "${cliente.name}"?`)) return
    await deleteCliente(cliente.id)
    if (editing?.id === cliente.id) resetForm()
    loadClientes()
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? `Editar cliente: ${editing.name}` : 'Cadastrar cliente'}</CardTitle>
        </CardHeader>
        <form key={editing ? `edit-${editing.id}` : `new-${formKey}`} onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <RequiredLabel htmlFor="name">Nome</RequiredLabel>
              <Input id="name" name="name" required defaultValue={editing?.name} />
              {fieldErrors.name?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <RequiredLabel htmlFor="email">Email</RequiredLabel>
              <Input id="email" name="email" type="email" required defaultValue={editing?.email ?? ''} />
              {fieldErrors.email?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <RequiredLabel htmlFor="phone">Telefone</RequiredLabel>
              <Input
                id="phone"
                name="phone"
                required
                placeholder="(11) 91234-5678"
                maxLength={15}
                defaultValue={formatPhone(editing?.phone ?? '')}
                onChange={(e) => {
                  e.target.value = formatPhone(e.target.value)
                }}
              />
              {fieldErrors.phone?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <RequiredLabel htmlFor="address">Endereço</RequiredLabel>
              <Input id="address" name="address" required defaultValue={editing?.address ?? ''} />
              {fieldErrors.address?.map((msg) => (
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
            <Button type="button" variant="outline" onClick={resetForm}>
              Limpar formulário
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : clientes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">Nome</th>
                    <th className="py-2 pr-2 font-medium">Email</th>
                    <th className="py-2 pr-2 font-medium">Telefone</th>
                    <th className="py-2 pr-2 font-medium">Endereço</th>
                    <th className="py-2 pr-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-b last:border-0">
                      <td className="py-2 pr-2">{cliente.name}</td>
                      <td className="py-2 pr-2">{cliente.email ?? '—'}</td>
                      <td className="py-2 pr-2">{cliente.phone ? formatPhone(cliente.phone) : '—'}</td>
                      <td className="py-2 pr-2">{cliente.address ?? '—'}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => setEditing(cliente)}>
                          Editar
                        </Button>{' '}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(cliente)}>
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
