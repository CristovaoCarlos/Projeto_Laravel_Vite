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
import { ApiError, type TipoUsuario } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const isLogin = ref(true)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const tipoUsuario = ref<TipoUsuario>('vendedor')

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = null
  fieldErrors.value = {}
}

async function handleSubmit() {
  error.value = null
  fieldErrors.value = {}
  isSubmitting.value = true

  try {
    if (isLogin.value) {
      await auth.login({ email: email.value, password: password.value })
    } else {
      await auth.register({
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
        tipo_usuario: tipoUsuario.value,
      })
    }
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
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle>{{ isLogin ? 'Entrar' : 'Criar conta' }}</CardTitle>
      <CardDescription>
        {{ isLogin ? 'Acesse sua conta para continuar.' : 'Preencha os dados para se registrar.' }}
      </CardDescription>
    </CardHeader>
    <form @submit.prevent="handleSubmit">
      <CardContent class="flex flex-col gap-3">
        <div v-if="!isLogin" class="flex flex-col gap-1">
          <label for="name" class="text-sm font-medium">Nome</label>
          <Input id="name" v-model="name" type="text" required autocomplete="name" />
          <p v-for="msg in fieldErrors.name" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">Email</label>
          <Input id="email" v-model="email" type="email" required autocomplete="email" />
          <p v-for="msg in fieldErrors.email" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium">Senha</label>
          <Input
            id="password"
            v-model="password"
            type="password"
            required
            :autocomplete="isLogin ? 'current-password' : 'new-password'"
          />
          <p v-for="msg in fieldErrors.password" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>

        <div v-if="!isLogin" class="flex flex-col gap-1">
          <label for="password_confirmation" class="text-sm font-medium">Confirmar senha</label>
          <Input id="password_confirmation" v-model="passwordConfirmation" type="password" required autocomplete="new-password" />
        </div>

        <div v-if="!isLogin" class="flex flex-col gap-1">
          <label for="tipo_usuario" class="text-sm font-medium">Tipo de usuário</label>
          <select
            id="tipo_usuario"
            v-model="tipoUsuario"
            required
            class="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
          >
            <option value="superadmin">Superadmin</option>
            <option value="vendedor">Vendedor</option>
            <option value="estoquista">Estoquista</option>
            <option value="historico">Histórico</option>
          </select>
          <p v-for="msg in fieldErrors.tipo_usuario" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
      </CardContent>
      <CardFooter class="flex flex-col items-stretch gap-2">
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Enviando...' : isLogin ? 'Entrar' : 'Registrar' }}
        </Button>
        <Button type="button" variant="link" @click="toggleMode">
          {{ isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Entrar' }}
        </Button>
      </CardFooter>
    </form>
  </Card>
</template>
