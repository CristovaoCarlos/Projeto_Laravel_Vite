import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import {
  ApiError,
  createHistorico,
  deleteHistorico,
  listHistoricos,
  listVendedores,
  type Historico,
  type Vendedor,
} from '@/lib/api'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function currentTimeString(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function LancarHistoricoPage() {
  const [historicos, setHistoricos] = useState<Historico[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [formKey, setFormKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<Historico | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function loadAll() {
    return Promise.all([listHistoricos(), listVendedores()]).then(([h, v]) => {
      setHistoricos(h)
      setVendedores(v)
    })
  }

  useEffect(() => {
    loadAll().finally(() => setIsLoadingList(false))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      cliente_nome: String(formData.get('cliente_nome') ?? ''),
      vendedor_id: Number(formData.get('vendedor_id')),
      valor: Number(formData.get('valor')),
      hora: String(formData.get('hora') ?? ''),
    }

    try {
      await createHistorico(data)
      setFormKey((k) => k + 1)
      loadAll()
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

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteHistorico(deleteTarget.id)
      setDeleteTarget(null)
      loadAll()
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Não foi possível excluir o lançamento.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lançar histórico</CardTitle>
        </CardHeader>
        <form key={formKey} onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label htmlFor="cliente_nome" className="text-sm font-medium">
                Nome do cliente
              </label>
              <Input id="cliente_nome" name="cliente_nome" required />
              {fieldErrors.cliente_nome?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="vendedor_id" className="text-sm font-medium">
                Vendedor
              </label>
              <select
                id="vendedor_id"
                name="vendedor_id"
                required
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {vendedores.map((vendedor) => (
                  <option key={vendedor.id} value={vendedor.id}>
                    {vendedor.nome}
                  </option>
                ))}
              </select>
              {fieldErrors.vendedor_id?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="valor" className="text-sm font-medium">
                Valor
              </label>
              <Input id="valor" name="valor" type="number" step="0.01" min="0" required />
              {fieldErrors.valor?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Data</span>
              <p className="flex h-8 items-center text-sm text-muted-foreground">{dateFormat.format(new Date())}</p>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="hora" className="text-sm font-medium">
                Hora
              </label>
              <Input id="hora" name="hora" type="time" required defaultValue={currentTimeString()} />
              {fieldErrors.hora?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </div>
            {error && <p className="col-span-2 text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Lançando...' : 'Lançar'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico lançado</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : historicos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">Cliente</th>
                    <th className="py-2 pr-2 font-medium">Vendedor</th>
                    <th className="py-2 pr-2 font-medium">Valor</th>
                    <th className="py-2 pr-2 font-medium">Data e hora</th>
                    <th className="py-2 pr-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {historicos.map((historico) => (
                    <tr key={historico.id} className="border-b last:border-0">
                      <td className="py-2 pr-2">{historico.cliente_nome}</td>
                      <td className="py-2 pr-2">{historico.vendedor?.nome ?? '—'}</td>
                      <td className="py-2 pr-2">{currency.format(Number(historico.valor))}</td>
                      <td className="py-2 pr-2">{dateTimeFormat.format(new Date(historico.data_hora))}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleteTarget(historico)
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
        title="Excluir lançamento"
        description={`Tem certeza que deseja excluir o lançamento de "${deleteTarget?.cliente_nome}"? Essa ação não pode ser desfeita.`}
        isConfirming={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
