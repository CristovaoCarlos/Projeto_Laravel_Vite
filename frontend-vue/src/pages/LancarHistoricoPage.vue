<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import Input from '@/components/ui/Input.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
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

const historicos = ref<Historico[]>([])
const vendedores = ref<Vendedor[]>([])
const isLoadingList = ref(true)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})
const deleteTarget = ref<Historico | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

const clienteNome = ref('')
const vendedorId = ref('')
const valor = ref('')
const hora = ref(currentTimeString())

function loadAll() {
  return Promise.all([listHistoricos(), listVendedores()]).then(([h, v]) => {
    historicos.value = h
    vendedores.value = v
  })
}

onMounted(() => {
  loadAll().finally(() => (isLoadingList.value = false))
})

function resetForm() {
  clienteNome.value = ''
  vendedorId.value = ''
  valor.value = ''
  hora.value = currentTimeString()
}

async function handleSubmit() {
  error.value = null
  fieldErrors.value = {}
  isSubmitting.value = true

  const data = {
    cliente_nome: clienteNome.value,
    vendedor_id: Number(vendedorId.value),
    valor: Number(valor.value),
    hora: hora.value,
  }

  try {
    await createHistorico(data)
    resetForm()
    loadAll()
  } catch (err) {
    if (err instanceof ApiError) {
      error.value = err.message
      fieldErrors.value = err.errors ?? {}
    } else {
      error.value = 'Não foi possível conectar à API.'
    }
  } finally {
    isSubmitting.value = false
  }
}

async function handleConfirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  deleteError.value = null
  try {
    await deleteHistorico(deleteTarget.value.id)
    deleteTarget.value = null
    loadAll()
  } catch (err) {
    deleteError.value = err instanceof ApiError ? err.message : 'Não foi possível excluir o lançamento.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Lançar histórico</CardTitle>
      </CardHeader>
      <form @submit.prevent="handleSubmit">
        <CardContent class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1 sm:col-span-2">
            <label for="cliente_nome" class="text-sm font-medium">Nome do cliente</label>
            <Input id="cliente_nome" v-model="clienteNome" required />
            <p v-for="msg in fieldErrors.cliente_nome" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <label for="vendedor_id" class="text-sm font-medium">Vendedor</label>
            <select
              id="vendedor_id"
              v-model="vendedorId"
              required
              class="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
            >
              <option value="" disabled>Selecione...</option>
              <option v-for="vendedor in vendedores" :key="vendedor.id" :value="String(vendedor.id)">
                {{ vendedor.nome }}
              </option>
            </select>
            <p v-for="msg in fieldErrors.vendedor_id" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <label for="valor" class="text-sm font-medium">Valor</label>
            <Input id="valor" v-model="valor" type="number" step="0.01" min="0" required />
            <p v-for="msg in fieldErrors.valor" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium">Data</span>
            <p class="flex h-8 items-center text-sm text-muted-foreground">{{ dateFormat.format(new Date()) }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <label for="hora" class="text-sm font-medium">Hora</label>
            <Input id="hora" v-model="hora" type="time" required />
            <p v-for="msg in fieldErrors.hora" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
          </div>
          <p v-if="error" class="text-sm text-destructive sm:col-span-2">{{ error }}</p>
        </CardContent>
        <CardFooter>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Lançando...' : 'Lançar' }}
          </Button>
        </CardFooter>
      </form>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Histórico lançado</CardTitle>
      </CardHeader>
      <CardContent>
        <p v-if="isLoadingList" class="text-sm text-muted-foreground">Carregando...</p>
        <p v-else-if="historicos.length === 0" class="text-sm text-muted-foreground">Nenhum lançamento registrado.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-muted-foreground">
                <th class="py-2 pr-2 font-medium">Cliente</th>
                <th class="py-2 pr-2 font-medium">Vendedor</th>
                <th class="py-2 pr-2 font-medium">Valor</th>
                <th class="py-2 pr-2 font-medium">Data e hora</th>
                <th class="py-2 pr-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="historico in historicos" :key="historico.id" class="border-b last:border-0">
                <td class="py-2 pr-2">{{ historico.cliente_nome }}</td>
                <td class="py-2 pr-2">{{ historico.vendedor?.nome ?? '—' }}</td>
                <td class="py-2 pr-2">{{ currency.format(Number(historico.valor)) }}</td>
                <td class="py-2 pr-2 whitespace-nowrap">{{ dateTimeFormat.format(new Date(historico.data_hora)) }}</td>
                <td class="py-2 pr-2 whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="destructive"
                    @click="
                      () => {
                        deleteTarget = historico
                        deleteError = null
                      }
                    "
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Excluir lançamento"
      :description="`Tem certeza que deseja excluir o lançamento de &quot;${deleteTarget?.cliente_nome}&quot;? Essa ação não pode ser desfeita.`"
      :is-confirming="isDeleting"
      :error="deleteError"
      @update:open="
        (open) => {
          if (!open) {
            deleteTarget = null
            deleteError = null
          }
        }
      "
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
