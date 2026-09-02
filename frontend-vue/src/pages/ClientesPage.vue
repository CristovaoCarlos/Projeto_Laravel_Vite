<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardAction from '@/components/ui/CardAction.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Input from '@/components/ui/Input.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ApiError, deleteCliente, listClientes, listVendedores, type Cliente, type Vendedor } from '@/lib/api'
import { formatCep, formatPhone, normalize } from '@/lib/format'
import ClienteForm from './ClienteForm.vue'

const emit = defineEmits<{
  'new-pedido': [clienteId: number]
}>()

function matchesSearch(cliente: Cliente, term: string): boolean {
  const trimmed = normalize(term.trim())
  if (!trimmed) return true

  const digits = term.replace(/\D/g, '')
  const nameMatch = normalize(cliente.name).includes(trimmed)
  const idMatch = String(cliente.id).includes(trimmed)
  const phoneMatch = digits !== '' && cliente.phone.replace(/\D/g, '').includes(digits)

  return nameMatch || idMatch || phoneMatch
}

const clientes = ref<Cliente[]>([])
const vendedores = ref<Vendedor[]>([])
const isLoadingList = ref(true)
const editing = ref<Cliente | null>(null)
const isCreating = ref(false)
const deleteTarget = ref<Cliente | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)
const searchInput = ref('')
const search = ref('')

const isFormOpen = computed(() => isCreating.value || editing.value !== null)
const filteredClientes = computed(() => clientes.value.filter((cliente) => matchesSearch(cliente, search.value)))

function loadClientes() {
  return listClientes().then((data) => (clientes.value = data))
}

onMounted(() => {
  Promise.all([loadClientes(), listVendedores().then((data) => (vendedores.value = data))]).finally(
    () => (isLoadingList.value = false),
  )
})

function closeForm() {
  isCreating.value = false
  editing.value = null
}

async function handleConfirmDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  deleteError.value = null
  try {
    await deleteCliente(deleteTarget.value.id)
    if (editing.value?.id === deleteTarget.value.id) editing.value = null
    deleteTarget.value = null
    loadClientes()
  } catch (err) {
    deleteError.value = err instanceof ApiError ? err.message : 'Não foi possível excluir o cliente.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <ClienteForm
      v-if="isFormOpen"
      :cliente="editing"
      :vendedor="vendedores"
      @saved="
        () => {
          closeForm()
          loadClientes()
        }
      "
      @cancel="closeForm"
    />

    <Card v-else>
      <CardHeader>
        <CardTitle>Clientes cadastrados</CardTitle>
        <CardAction>
          <Button size="sm" @click="isCreating = true">Novo Cliente</Button>
        </CardAction>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-2 sm:flex-row">
          <Input
            v-model="searchInput"
            placeholder="Buscar por ID, nome ou telefone"
            @keydown.enter.prevent="search = searchInput"
          />
          <div class="flex gap-2">
            <Button type="button" class="flex-1 sm:flex-initial" @click="search = searchInput">
              <Search />
              Buscar
            </Button>
            <Button
              v-if="search"
              type="button"
              variant="outline"
              class="flex-1 sm:flex-initial"
              @click="
                () => {
                  searchInput = ''
                  search = ''
                }
              "
            >
              Limpar
            </Button>
          </div>
        </div>

        <p v-if="isLoadingList" class="text-sm text-muted-foreground">Carregando...</p>
        <p v-else-if="clientes.length === 0" class="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
        <p v-else-if="filteredClientes.length === 0" class="text-sm text-muted-foreground">
          Nenhum cliente encontrado para "{{ search }}".
        </p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-muted-foreground">
                <th class="py-2 pr-2 font-medium">ID</th>
                <th class="py-2 pr-2 font-medium">Nome</th>
                <th class="py-2 pr-2 font-medium">Telefone</th>
                <th class="py-2 pr-2 font-medium">Email</th>
                <th class="py-2 pr-2 font-medium">Endereço</th>
                <th class="py-2 pr-2 font-medium">Localização</th>
                <th class="py-2 pr-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="cliente in filteredClientes" :key="cliente.id" class="border-b last:border-0">
                <td class="py-2 pr-2 text-muted-foreground">{{ cliente.id }}</td>
                <td class="py-2 pr-2">{{ cliente.name }}</td>
                <td class="py-2 pr-2">{{ formatPhone(cliente.phone) }}</td>
                <td class="py-2 pr-2">{{ cliente.email ?? '—' }}</td>
                <td class="py-2 pr-2">
                  {{ cliente.street }}, {{ cliente.number ?? 's/n' }} - {{ cliente.city }} - {{ cliente.state }},
                  {{ formatCep(cliente.zip_code) }}
                </td>
                <td class="py-2 pr-2">
                  <a
                    v-if="cliente.location"
                    :href="`https://www.google.com/maps?q=${encodeURIComponent(cliente.location)}`"
                    target="_blank"
                    rel="noreferrer"
                    class="text-primary underline-offset-4 hover:underline"
                  >
                    Ver mapa
                  </a>
                  <template v-else>—</template>
                </td>
                <td class="py-2 pr-2 whitespace-nowrap">
                  <div class="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      :disabled="!!cliente.pedidos_count"
                      :title="cliente.pedidos_count ? 'Cliente possui pedidos registrados — edição bloqueada' : undefined"
                      @click="editing = cliente"
                    >
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" @click="emit('new-pedido', cliente.id)">Novo Pedido</Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      @click="
                        () => {
                          deleteTarget = cliente
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
      title="Excluir cliente"
      :description="`Tem certeza que deseja excluir o cliente &quot;${deleteTarget?.name}&quot;? Essa ação não pode ser desfeita.`"
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
