<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardAction from '@/components/ui/CardAction.vue'
import CardContent from '@/components/ui/CardContent.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ApiError, deleteUsuario, listUsuarios, type TipoUsuario, type User } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import UsuarioForm from './UsuarioForm.vue'

const TIPO_LABELS: Record<TipoUsuario, string> = {
  superadmin: 'Superadmin',
  vendedor: 'Vendedor',
  estoquista: 'Estoquista',
  historico: 'Histórico',
}

const auth = useAuthStore()

const usuarios = ref<User[]>([])
const isLoadingList = ref(true)
const editing = ref<User | null>(null)
const isCreating = ref(false)
const deleteTarget = ref<User | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

const isFormOpen = computed(() => isCreating.value || editing.value !== null)

function loadUsuarios() {
  return listUsuarios().then((data) => (usuarios.value = data))
}

onMounted(() => {
  loadUsuarios().finally(() => (isLoadingList.value = false))
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
    await deleteUsuario(deleteTarget.value.id)
    if (editing.value?.id === deleteTarget.value.id) editing.value = null
    deleteTarget.value = null
    loadUsuarios()
  } catch (err) {
    deleteError.value = err instanceof ApiError ? err.message : 'Não foi possível excluir o usuário.'
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <UsuarioForm
      v-if="isFormOpen"
      :usuario="editing"
      @saved="
        () => {
          closeForm()
          loadUsuarios()
        }
      "
      @cancel="closeForm"
    />

    <Card v-else>
      <CardHeader>
        <CardTitle>Usuários cadastrados</CardTitle>
        <CardAction>
          <Button size="sm" @click="isCreating = true">Novo Usuário</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p v-if="isLoadingList" class="text-sm text-muted-foreground">Carregando...</p>
        <p v-else-if="usuarios.length === 0" class="text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-muted-foreground">
                <th class="py-2 pr-2 font-medium">ID</th>
                <th class="py-2 pr-2 font-medium">Nome</th>
                <th class="py-2 pr-2 font-medium">Email</th>
                <th class="py-2 pr-2 font-medium">Tipo</th>
                <th class="py-2 pr-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuarios" :key="usuario.id" class="border-b last:border-0">
                <td class="py-2 pr-2 text-muted-foreground">{{ usuario.id }}</td>
                <td class="py-2 pr-2">
                  {{ usuario.name }}
                  <span v-if="usuario.id === auth.user?.id" class="text-xs text-muted-foreground">(você)</span>
                </td>
                <td class="py-2 pr-2">{{ usuario.email }}</td>
                <td class="py-2 pr-2">{{ TIPO_LABELS[usuario.tipo_usuario] }}</td>
                <td class="py-2 pr-2 whitespace-nowrap">
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline" @click="editing = usuario">Editar</Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      :disabled="usuario.id === auth.user?.id"
                      :title="usuario.id === auth.user?.id ? 'Você não pode excluir seu próprio usuário' : undefined"
                      @click="
                        () => {
                          deleteTarget = usuario
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
      title="Excluir usuário"
      :description="`Tem certeza que deseja excluir o usuário &quot;${deleteTarget?.name}&quot;? Essa ação não pode ser desfeita.`"
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
