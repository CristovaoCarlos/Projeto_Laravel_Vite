<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardAction from '@/components/ui/CardAction.vue'
import CardContent from '@/components/ui/CardContent.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ApiError, deleteVendedor, listVendedores, type Vendedor } from '@/lib/api'
import VendedorForm from './VendedorForm.vue'

const vendedores = ref<Vendedor[]>([])
const isLoadingList = ref(true)
const editing = ref<Vendedor | null>(null)
const isCreating = ref(false)
const deleteTarget = ref<Vendedor | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

const isFormOpen = computed(() => isCreating.value || editing.value !== null)

function loadVendedores() {
  return listVendedores().then((data) => (vendedores.value = data))
}

onMounted(() => {
  loadVendedores().finally(() => (isLoadingList.value = false))
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
    await deleteVendedor(deleteTarget.value.id)
    if (editing.value?.id === deleteTarget.value.id) editing.value = null
    deleteTarget.value = null
    loadVendedores()
  } catch (err) {
    deleteError.value = err instanceof ApiError ? err.message : 'Não foi possível excluir o vendedor.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <VendedorForm
      v-if="isFormOpen"
      :vendedor="editing"
      @saved="
        () => {
          closeForm()
          loadVendedores()
        }
      "
      @cancel="closeForm"
    />

    <Card v-else>
      <CardHeader>
        <CardTitle>Vendedores cadastrados</CardTitle>
        <CardAction>
          <Button size="sm" @click="isCreating = true">Novo Vendedor</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p v-if="isLoadingList" class="text-sm text-muted-foreground">Carregando...</p>
        <p v-else-if="vendedores.length === 0" class="text-sm text-muted-foreground">Nenhum vendedor cadastrado.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-muted-foreground">
                <th class="py-2 pr-2 font-medium">ID</th>
                <th class="py-2 pr-2 font-medium">Nome</th>
                <th class="py-2 pr-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="vendedor in vendedores" :key="vendedor.id" class="border-b last:border-0">
                <td class="py-2 pr-2 text-muted-foreground">{{ vendedor.id }}</td>
                <td class="py-2 pr-2">{{ vendedor.nome }}</td>
                <td class="py-2 pr-2 whitespace-nowrap">
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline" @click="editing = vendedor">Editar</Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      @click="
                        () => {
                          deleteTarget = vendedor
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
      title="Excluir vendedor"
      :description="`Tem certeza que deseja excluir o vendedor &quot;${deleteTarget?.nome}&quot;? Essa ação não pode ser desfeita.`"
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
