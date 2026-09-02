<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import Input from '@/components/ui/Input.vue'
import {
  ApiError,
  comprovanteUrl,
  createPedido,
  updatePedido,
  type Cliente,
  type Pedido,
  type Vendedor,
  type PedidoStatus,
  type Produto,
  type TipoPagamento,
} from '@/lib/api'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const TIPOS_PAGAMENTO: { value: TipoPagamento; label: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'pix', label: 'Pix' },
]

const STATUS_PEDIDO: { value: PedidoStatus; label: string }[] = [
  { value: 'aguardando_pagamento', label: 'Aguardando pagamento' },
  { value: 'pagamento_efetuado', label: 'Pagamento efetuado' },
]

type ItemForm = { produto_id: number; quantidade: number }

const props = defineProps<{
  pedido: Pedido | null
  vendedores: Vendedor[]
  clientes: Cliente[]
  produtos: Produto[]
  initialClienteId?: number
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const clienteId = ref(
  props.pedido ? String(props.pedido.cliente_id) : props.initialClienteId ? String(props.initialClienteId) : '',
)
const vendedorId = ref(props.pedido?.vendedor_id ? String(props.pedido.vendedor_id) : '')

watch(clienteId, () => {
  if (props.pedido) return
  const cliente = props.clientes.find((c) => c.id === Number(clienteId.value))
  vendedorId.value = cliente?.vendedor_id ? String(cliente.vendedor_id) : ''
})

const tipoPagamento = ref<TipoPagamento>(props.pedido?.tipo_pagamento ?? 'dinheiro')
const status = ref<PedidoStatus>(props.pedido?.status ?? 'aguardando_pagamento')
const comprovante = ref<File | null>(null)
const itens = ref<ItemForm[]>(
  props.pedido ? (props.pedido.itens ?? []).map((item) => ({ produto_id: item.produto_id, quantidade: item.quantidade })) : [],
)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

function addItem() {
  itens.value.push({ produto_id: props.produtos[0]?.id ?? 0, quantidade: 1 })
}

function removeItem(index: number) {
  itens.value.splice(index, 1)
}

function produtoFor(item: ItemForm) {
  return props.produtos.find((p) => p.id === item.produto_id)
}

function handleComprovanteChange(event: Event) {
  comprovante.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

const total = computed(() =>
  itens.value.reduce((sum, item) => {
    const produto = produtoFor(item)
    return sum + (produto ? Number(produto.price) * item.quantidade : 0)
  }, 0),
)

async function handleSubmit() {
  error.value = null

  if (!clienteId.value) {
    error.value = 'Selecione um cliente.'
    return
  }
  if (itens.value.length === 0) {
    error.value = 'Adicione ao menos um item ao pedido.'
    return
  }

  isSubmitting.value = true
  const data = {
    cliente_id: Number(clienteId.value),
    vendedor_id: Number(vendedorId.value),
    tipo_pagamento: tipoPagamento.value,
    status: status.value,
    comprovante_pagamento: comprovante.value,
    itens: itens.value,
  }

  try {
    if (props.pedido) {
      await updatePedido(props.pedido.id, data)
    } else {
      await createPedido(data)
    }
    emit('saved')
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Não foi possível conectar à API.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ pedido ? `Editar pedido #${pedido.id}` : 'Registrar pedido' }}</CardTitle>
    </CardHeader>
    <form @submit.prevent="handleSubmit">
      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="cliente_id" class="text-sm font-medium">Cliente</label>
          <select
            id="cliente_id"
            v-model="clienteId"
            class="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
          >
            <option value="">Selecione...</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="String(cliente.id)">
              {{ cliente.name }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label for="vendedor_id" class="text-sm font-medium">Vendedor</label>
          <select
            id="vendedor_id"
            v-model="vendedorId"
            class="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
          >
            <option value="">Selecione...</option>
            <option v-for="v in vendedores" :key="v.id" :value="String(v.id)">{{ v.nome }}</option>
          </select>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label for="tipo_pagamento" class="text-sm font-medium">Tipo de pagamento</label>
            <select
              id="tipo_pagamento"
              v-model="tipoPagamento"
              class="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
            >
              <option v-for="tipo in TIPOS_PAGAMENTO" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label for="status" class="text-sm font-medium">Status</label>
            <select id="status" v-model="status" class="h-8 rounded-lg border border-border bg-background px-2.5 text-sm">
              <option v-for="s in STATUS_PEDIDO" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label for="comprovante_pagamento" class="text-sm font-medium">Comprovante de pagamento</label>
          <input
            id="comprovante_pagamento"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground md:text-sm dark:bg-input/30"
            @change="handleComprovanteChange"
          />
          <a
            v-if="pedido?.comprovante_pagamento"
            :href="comprovanteUrl(pedido.comprovante_pagamento)"
            target="_blank"
            rel="noreferrer"
            class="text-xs text-primary underline-offset-4 hover:underline"
          >
            Ver comprovante atual
          </a>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-sm font-medium">Itens</span>
          <div
            v-for="(item, index) in itens"
            :key="index"
            class="flex flex-col gap-2 rounded-lg border border-border p-2 sm:flex-row sm:items-center sm:border-0 sm:p-0"
          >
            <select
              v-model="item.produto_id"
              class="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-sm sm:flex-1"
            >
              <option v-for="p in produtos" :key="p.id" :value="p.id">
                {{ p.description }} (estoque: {{ p.stock }})
              </option>
            </select>
            <div class="flex items-center gap-2">
              <Input v-model="item.quantidade" type="number" min="1" class="w-24" />
              <span class="w-24 text-right text-sm text-muted-foreground">
                {{ produtoFor(item) ? currency.format(Number(produtoFor(item)!.price) * item.quantidade) : '—' }}
              </span>
              <Button type="button" size="sm" variant="ghost" @click="removeItem(index)">Remover</Button>
            </div>
          </div>
          <Button type="button" size="sm" variant="outline" :disabled="produtos.length === 0" @click="addItem">
            Adicionar item
          </Button>
        </div>

        <p class="text-right text-sm font-medium">Total: {{ currency.format(total) }}</p>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
      </CardContent>
      <CardFooter class="gap-2">
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Salvando...' : pedido ? 'Salvar alterações' : 'Registrar pedido' }}
        </Button>
        <Button type="button" variant="outline" @click="emit('cancel')">Cancelar</Button>
      </CardFooter>
    </form>
  </Card>
</template>
