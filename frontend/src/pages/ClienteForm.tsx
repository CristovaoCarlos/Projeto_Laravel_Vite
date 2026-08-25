import { useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError, createCliente, updateCliente, type Cliente } from '@/lib/api'
import { formatCep, formatPhone } from '@/lib/format'
import { lookupCep } from '@/lib/viacep'

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

export function ClienteForm({
  cliente,
  onSaved,
  onCancel,
}: {
  cliente: Cliente | null
  onSaved: () => void
  onCancel?: () => void
}) {
  const [formKey, setFormKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isLookingUpCep, setIsLookingUpCep] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const streetRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const stateRef = useRef<HTMLInputElement>(null)

  function handleClear() {
    setError(null)
    setFieldErrors({})
    setCepError(null)
    setFormKey((k) => k + 1)
  }

  async function handleCepBlur(event: FocusEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, '')
    if (digits.length !== 8) return

    setCepError(null)
    setIsLookingUpCep(true)
    try {
      const result = await lookupCep(digits)
      if (!result) {
        setCepError('CEP não encontrado.')
        return
      }
      if (streetRef.current) streetRef.current.value = result.street
      if (cityRef.current) cityRef.current.value = result.city
      if (stateRef.current) stateRef.current.value = result.state
    } catch {
      setCepError('Não foi possível consultar o CEP.')
    } finally {
      setIsLookingUpCep(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: String(formData.get('name') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      email: String(formData.get('email') ?? ''),
      street: String(formData.get('street') ?? ''),
      number: String(formData.get('number') ?? ''),
      city: String(formData.get('city') ?? ''),
      state: String(formData.get('state') ?? ''),
      zip_code: String(formData.get('zip_code') ?? ''),
      location: String(formData.get('location') ?? ''),
    }

    try {
      if (cliente) {
        await updateCliente(cliente.id, data)
      } else {
        await createCliente(data)
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
        <CardTitle>{cliente ? `Editar cliente: ${cliente.name}` : 'Cadastrar cliente'}</CardTitle>
        {cliente && <CardDescription>ID: {cliente.id}</CardDescription>}
      </CardHeader>
      <form key={cliente ? `edit-${cliente.id}` : `new-${formKey}`} onSubmit={handleSubmit}>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1">
            <RequiredLabel htmlFor="name">Nome</RequiredLabel>
            <Input id="name" name="name" required defaultValue={cliente?.name} />
            {fieldErrors.name?.map((msg) => (
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
              placeholder="(XX) XXXXX-XXXX"
              maxLength={15}
              pattern="^\(\d{2}\) \d{5}-\d{4}$"
              title="Formato: (XX) XXXXX-XXXX"
              defaultValue={formatPhone(cliente?.phone ?? '')}
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
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" defaultValue={cliente?.email ?? ''} />
            {fieldErrors.email?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <RequiredLabel htmlFor="street">Rua</RequiredLabel>
            <Input id="street" name="street" required ref={streetRef} defaultValue={cliente?.street} />
            {fieldErrors.street?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <RequiredLabel htmlFor="number">Número</RequiredLabel>
            <Input id="number" name="number" required defaultValue={cliente?.number ?? ''} />
            {fieldErrors.number?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <RequiredLabel htmlFor="city">Cidade</RequiredLabel>
            <Input id="city" name="city" required ref={cityRef} defaultValue={cliente?.city} />
            {fieldErrors.city?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <RequiredLabel htmlFor="state">Estado</RequiredLabel>
            <Input id="state" name="state" required ref={stateRef} defaultValue={cliente?.state} />
            {fieldErrors.state?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <RequiredLabel htmlFor="zip_code">CEP</RequiredLabel>
            <Input
              id="zip_code"
              name="zip_code"
              required
              placeholder="00000-000"
              maxLength={9}
              pattern="^\d{5}-\d{3}$"
              title="Formato: 00000-000"
              defaultValue={formatCep(cliente?.zip_code ?? '')}
              onChange={(e) => {
                e.target.value = formatCep(e.target.value)
              }}
              onBlur={handleCepBlur}
            />
            {isLookingUpCep && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
            {cepError && <p className="text-xs text-destructive">{cepError}</p>}
            {fieldErrors.zip_code?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="location" className="text-sm font-medium">
              Localização (Google Maps)
            </label>
            <Input
              id="location"
              name="location"
              placeholder="-23.550520, -46.633309"
              pattern="^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$"
              title="Formato: latitude, longitude (ex: -23.550520, -46.633309)"
              defaultValue={cliente?.location ?? ''}
            />
            {fieldErrors.location?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>

          {error && <p className="col-span-2 text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : cliente ? 'Salvar alterações' : 'Cadastrar'}
          </Button>
          {!cliente && (
            <Button type="button" variant="outline" onClick={handleClear}>
              Limpar formulário
            </Button>
          )}
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
