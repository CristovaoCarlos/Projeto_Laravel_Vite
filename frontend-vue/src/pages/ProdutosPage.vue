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
import { ApiError, deleteProduto, listProdutos, type Produto } from '@/lib/api'
import { normalize } from '@/lib/format'
import ProdutoForm from './ProdutoForm.vue'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function matchesSearch(produto: Produto, term: string): boolean {
  const trimmed = normalize(term.trim())
  if (!trimmed) return true

  const descriptionMatch = normalize(produto.description).includes(trimmed)
  const idMatch = String(produto.id).includes(trimmed)

  return descriptionMatch || idMatch
}

const produtos = ref<Produto[]>([])
const isLoadingList = ref(true)
const editing = ref<Produto | null>(null)
const isCreating = ref(false)
const deleteTarget = ref<Produto | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)
const searchInput = ref('')
const search = ref('')

const isFormOpen = computed(() => isCreating.value || editing.value !== null)
const filteredProdutos = computed(() => produtos.value.filter((produto) => matchesSearch(produto, search.value)))

function loadProdutos() {
  return listProdutos().then((data) => (produtos.value = data))
}

onMounted(() => {
  loadProdutos().finally(() => (isLoadingList.value = false))
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
    await deleteProduto(deleteTarget.value.id)
    if (editing.value?.id === deleteTarget.value.id) editing.value = null
    deleteTarget.value = null
    loadProdutos()
  } catch (err) {
    deleteError.value = err instanceof ApiError ? err.message : 'Não foi possível excluir o produto.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <ProdutoForm
      v-if="isFormOpen"
      :produto="editing"
      @saved="
        () => {
          closeForm()
          loadProdutos()
        }
      "
      @cancel="closeForm"
    />

    <Card v-else>
      <CardHeader>
        <CardTitle>Produtos cadastrados</CardTitle>
        <CardAction>
          <Button size="sm" @click="isCreating = true">Novo Produto</Button>
        </CardAction>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-2 sm:flex-row">
          <Input
            v-model="searchInput"
            placeholder="Buscar por ID ou descrição"
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
        <p v-else-if="produtos.length === 0" class="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
        <p v-else-if="filteredProdutos.length === 0" class="text-sm text-muted-foreground">
          Nenhum produto encontrado para "{{ search }}".
        </p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-muted-foreground">
                <th class="py-2 pr-2 font-medium">Descrição</th>
                <th class="py-2 pr-2 font-medium">Preço</th>
                <th class="py-2 pr-2 font-medium">Estoque</th>
                <th class="py-2 pr-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="produto in filteredProdutos" :key="produto.id" class="border-b last:border-0">
                <td class="py-2 pr-2">{{ produto.description }}</td>
                <td class="py-2 pr-2">{{ currency.format(Number(produto.price)) }}</td>
                <td class="py-2 pr-2">{{ produto.stock }}</td>
                <td class="py-2 pr-2 whitespace-nowrap">
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline" @click="editing = produto">Editar</Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      @click="
                        () => {
                          deleteTarget = produto
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
      title="Excluir produto"
      :description="`Tem certeza que deseja excluir o produto &quot;${deleteTarget?.description}&quot;? Essa ação não pode ser desfeita.`"
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
