import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/use-auth'
import { Dashboard } from '@/Dashboard'

function AuthForm() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    try {
      if (isLogin) {
        await login({ email, password })
      } else {
        await register({
          name: String(formData.get('name') ?? ''),
          email,
          password,
          password_confirmation: String(formData.get('password_confirmation') ?? ''),
        })
      }
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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{isLogin ? 'Entrar' : 'Criar conta'}</CardTitle>
        <CardDescription>
          {isLogin ? 'Acesse sua conta para continuar.' : 'Preencha os dados para se registrar.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-3">
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm font-medium">
                Nome
              </label>
              <Input id="name" name="name" type="text" required autoComplete="name" />
              {fieldErrors.name?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
            {fieldErrors.email?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {fieldErrors.password?.map((msg) => (
              <p key={msg} className="text-xs text-destructive">
                {msg}
              </p>
            ))}
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label htmlFor="password_confirmation" className="text-sm font-medium">
                Confirmar senha
              </label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : isLogin ? 'Entrar' : 'Registrar'}
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setIsLogin((v) => !v)
              setError(null)
              setFieldErrors({})
            }}
          >
            {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Entrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <AuthForm />
    </div>
  )
}

export default App
