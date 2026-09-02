import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError, createProduto, updateProduto, type Produto } from '@/lib/api'

export function ProdutoForm({
  produto,
  onSaved,
  onCancel,
}: {
  produto: Produto | null
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
    const data = {
      description: String(formData.get('description') ?? ''),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
    }

    try {
      if (produto) {
        await updateProduto(produto.id, data)
      } else {
        await createProduto(data)
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
        <CardTitle>{produto ? `Editar produto: ${produto.description}` : 'Cadastrar produto'}</CardTitle>
        {produto && <CardDescription>ID: {produto.id}</CardDescription>}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Input id="description" name="description" required defaultValue={produto?.description} />
            {fieldErrors.description?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
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
              defaultValue={produto?.price}
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
            <Input id="stock" name="stock" type="number" min="0" required defaultValue={produto?.stock} />
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
            {isSubmitting ? 'Salvando...' : produto ? 'Salvar alterações' : 'Cadastrar'}
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
