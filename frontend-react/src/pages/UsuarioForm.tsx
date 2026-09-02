import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError, createUsuario, updateUsuario, type TipoUsuario, type User } from '@/lib/api'

const TIPO_LABELS: Record<TipoUsuario, string> = {
  superadmin: 'Superadmin',
  vendedor: 'Vendedor',
  estoquista: 'Estoquista',
  historico: 'Histórico',
}

export function UsuarioForm({
  usuario,
  onSaved,
  onCancel,
}: {
  usuario: User | null
  onSaved: () => void
  onCancel?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')
    const data = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      tipo_usuario: String(formData.get('tipo_usuario') ?? '') as TipoUsuario,
      ...(password ? { password } : {}),
    }

    try {
      if (usuario) {
        await updateUsuario(usuario.id, data)
      } else {
        await createUsuario(data)
      }
      onSaved()
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{usuario ? `Editar usuário: ${usuario.name}` : 'Cadastrar usuário'}</CardTitle>
        {usuario && <CardDescription>ID: {usuario.id}</CardDescription>}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Nome
            </label>
            <Input id="name" name="name" required defaultValue={usuario?.name} />
            {fieldErrors.name?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" required defaultValue={usuario?.email} />
            {fieldErrors.email?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="tipo_usuario" className="text-sm font-medium">
              Tipo de usuário
            </label>
            <select
              id="tipo_usuario"
              name="tipo_usuario"
              required
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
              defaultValue={usuario?.tipo_usuario ?? 'vendedor'}
            >
              {Object.entries(TIPO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {fieldErrors.tipo_usuario?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              {usuario ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
            </label>
            <Input id="password" name="password" type="password" required={!usuario} />
            {fieldErrors.password?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>
          {error && <p className="col-span-2 text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : usuario ? 'Salvar alterações' : 'Cadastrar'}
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
