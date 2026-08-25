import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '@/components/ui/button'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Excluir',
  isConfirming = false,
  error,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  isConfirming?: boolean
  error?: string | null
  onConfirm: () => void
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-black/50" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
          <AlertDialog.Title className="text-base font-medium">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Close render={<Button variant="outline">Cancelar</Button>} />
            <Button variant="destructive" onClick={onConfirm} disabled={isConfirming}>
              {isConfirming ? 'Excluindo...' : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
