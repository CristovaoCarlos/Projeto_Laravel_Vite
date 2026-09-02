<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'
import Input from '@/components/ui/Input.vue'
import { ApiError, createUsuario, updateUsuario, type TipoUsuario, type User } from '@/lib/api'

const TIPO_LABELS: Record<TipoUsuario, string> = {
  superadmin: 'Superadmin',
  vendedor: 'Vendedor',
  estoquista: 'Estoquista',
  historico: 'Histórico',
}

const props = defineProps<{
  usuario: User | null
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const name = ref(props.usuario?.name ?? '')
const email = ref(props.usuario?.email ?? '')
const tipoUsuario = ref<TipoUsuario>(props.usuario?.tipo_usuario ?? 'vendedor')
const password = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

async function handleSubmit() {
  error.value = null
  fieldErrors.value = {}
  isSubmitting.value = true

  const data = {
    name: name.value,
    email: email.value,
    tipo_usuario: tipoUsuario.value,
    ...(password.value ? { password: password.value } : {}),
  }

  try {
    if (props.usuario) {
      await updateUsuario(props.usuario.id, data)
    } else {
      await createUsuario(data)
    }
    emit('saved')
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
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ usuario ? `Editar usuário: ${usuario.name}` : 'Cadastrar usuário' }}</CardTitle>
      <CardDescription v-if="usuario">ID: {{ usuario.id }}</CardDescription>
    </CardHeader>
    <form @submit.prevent="handleSubmit">
      <CardContent class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label for="name" class="text-sm font-medium">Nome</label>
          <Input id="name" v-model="name" required />
          <p v-for="msg in fieldErrors.name" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">Email</label>
          <Input id="email" v-model="email" type="email" required />
          <p v-for="msg in fieldErrors.email" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="tipo_usuario" class="text-sm font-medium">Tipo de usuário</label>
          <select
            id="tipo_usuario"
            v-model="tipoUsuario"
            required
            class="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
          >
            <option v-for="(label, value) in TIPO_LABELS" :key="value" :value="value">{{ label }}</option>
          </select>
          <p v-for="msg in fieldErrors.tipo_usuario" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label for="password" class="text-sm font-medium">
            {{ usuario ? 'Nova senha (deixe em branco para manter)' : 'Senha' }}
          </label>
          <Input id="password" v-model="password" type="password" :required="!usuario" />
          <p v-for="msg in fieldErrors.password" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <p v-if="error" class="text-sm text-destructive sm:col-span-2">{{ error }}</p>
      </CardContent>
      <CardFooter class="gap-2">
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Salvando...' : usuario ? 'Salvar alterações' : 'Cadastrar' }}
        </Button>
        <Button type="button" variant="outline" @click="emit('cancel')">Cancelar</Button>
      </CardFooter>
    </form>
  </Card>
</template>
