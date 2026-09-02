<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardAction from '@/components/ui/CardAction.vue'
import CardContent from '@/components/ui/CardContent.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import {
  ApiError,
  comprovanteUrl,
  deletePedido,
  listClientes,
  listPedidos,
  listProdutos,
  listVendedores,
  type Cliente,
  type Pedido,
  type PedidoStatus,
  type Produto,
  type TipoPagamento,
  type Vendedor,
} from '@/lib/api'
import PedidoForm from './PedidoForm.vue'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const TIPO_PAGAMENTO_LABELS: Record<TipoPagamento, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'Pix',
}

const STATUS_LABELS: Record<PedidoStatus, string> = {
  aguardando_pagamento: 'Aguardando pagamento',
  pagamento_efetuado: 'Pagamento efetuado',
}

const props = defineProps<{
  initialClienteId?: number | null
}>()

const emit = defineEmits<{
  'consume-initial-cliente-id': []
}>()

const pedidos = ref<Pedido[]>([])
const vendedores = ref<Vendedor[]>([])
const clientes = ref<Cliente[]>([])
const produtos = ref<Produto[]>([])
const isLoadingList = ref(true)
const editing = ref<Pedido | null>(null)
const isCreating = ref(false)
const deleteTarget = ref<Pedido | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

const isFormOpen = computed(() => isCreating.value || editing.value !== null || props.initialClienteId != null)

function loadAll() {
  return Promise.all([listPedidos(), listClientes(), listProdutos(), listVendedores()]).then(([v, c, p, ve]) => {
    pedidos.value = v
    clientes.value = c
    produtos.value = p
    vendedores.value = ve
  })
}

onMounted(() => {
  loadAll().finally(() => (isLoadingList.value = false))
})

function closeForm() {
  isCreating.value = false
  editing.value = null
  emit('consume-initial-cliente-id')
}

async function handleConfirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  deleteError.value = null
  try {
    await deletePedido(deleteTarget.value.id)
    if (editing.value?.id === deleteTarget.value.id) editing.value = null
    deleteTarget.value = null
    loadAll()
  } catch (err) {
    deleteError.value = err instanceof ApiError ? err.message : 'Não foi possível excluir o pedido.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <PedidoForm
      v-if="isFormOpen"
      :pedido="editing"
      :vendedores="vendedores"
      :clientes="clientes"
      :produtos="produtos"
      :initial-cliente-id="editing ? undefined : (initialClienteId ?? undefined)"
      @saved="
        () => {
          closeForm()
          loadAll()
        }
      "
      @cancel="closeForm"
    />

    <Card v-else>
      <CardHeader>
        <CardTitle>Pedidos realizados</CardTitle>
        <CardAction>
          <Button size="sm" @click="isCreating = true">Novo Pedido</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p v-if="isLoadingList" class="text-sm text-muted-foreground">Carregando...</p>
        <p v-else-if="pedidos.length === 0" class="text-sm text-muted-foreground">Nenhum pedido registrado.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-muted-foreground">
                <th class="py-2 pr-2 font-medium">#</th>
                <th class="py-2 pr-2 font-medium">Cliente</th>
                <th class="py-2 pr-2 font-medium">Itens</th>
                <th class="py-2 pr-2 font-medium">Pagamento</th>
                <th class="py-2 pr-2 font-medium">Status</th>
                <th class="py-2 pr-2 font-medium">Comprovante</th>
                <th class="py-2 pr-2 font-medium">Total</th>
                <th class="py-2 pr-2 font-medium">Data</th>
                <th class="py-2 pr-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="pedido in pedidos" :key="pedido.id" class="border-b last:border-0">
                <td class="py-2 pr-2">{{ pedido.id }}</td>
                <td class="py-2 pr-2">{{ pedido.cliente?.name ?? '—' }}</td>
                <td class="py-2 pr-2">{{ pedido.itens?.length ?? 0 }}</td>
                <td class="py-2 pr-2">{{ TIPO_PAGAMENTO_LABELS[pedido.tipo_pagamento] }}</td>
                <td class="py-2 pr-2">{{ STATUS_LABELS[pedido.status] }}</td>
                <td class="py-2 pr-2">
                  <a
                    v-if="pedido.comprovante_pagamento"
                    :href="comprovanteUrl(pedido.comprovante_pagamento)"
                    target="_blank"
                    rel="noreferrer"
                    class="text-primary underline-offset-4 hover:underline"
                  >
                    Ver
                  </a>
                  <template v-else>—</template>
                </td>
                <td class="py-2 pr-2">{{ currency.format(Number(pedido.total)) }}</td>
                <td class="py-2 pr-2">{{ dateFormat.format(new Date(pedido.created_at)) }}</td>
                <td class="py-2 pr-2 whitespace-nowrap">
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline" @click="editing = pedido">Editar</Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      @click="
                        () => {
                          deleteTarget = pedido
                          deleteError = null
                        }
                      "
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Excluir pedido"
      :description="`Tem certeza que deseja excluir o pedido #${deleteTarget?.id}? O estoque dos produtos será restaurado. Essa ação não pode ser desfeita.`"
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
