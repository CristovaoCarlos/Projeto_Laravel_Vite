import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError, createVendedor, updateVendedor, type Vendedor } from '@/lib/api'

export function VendedorForm({
  vendedor,
  onSaved,
  onCancel,
}: {
  vendedor: Vendedor | null
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
    const data = { nome: String(formData.get('nome') ?? '') }

    try {
      if (vendedor) {
        await updateVendedor(vendedor.id, data)
      } else {
        await createVendedor(data)
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
        <CardTitle>{vendedor ? `Editar vendedor: ${vendedor.nome}` : 'Cadastrar vendedor'}</CardTitle>
        {vendedor && <CardDescription>ID: {vendedor.id}</CardDescription>}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-1">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome
          </label>
          <Input id="nome" name="nome" required defaultValue={vendedor?.nome} />
          {fieldErrors.nome?.map((msg) => (
            <p key={msg} className="text-xs text-destructive">
              {msg}
            </p>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : vendedor ? 'Salvar alterações' : 'Cadastrar'}
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
