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
import { ApiError, createVendedor, updateVendedor, type Vendedor } from '@/lib/api'

const props = defineProps<{
  vendedor: Vendedor | null
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const nome = ref(props.vendedor?.nome ?? '')
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

async function handleSubmit() {
  error.value = null
  fieldErrors.value = {}
  isSubmitting.value = true

  try {
    if (props.vendedor) {
      await updateVendedor(props.vendedor.id, { nome: nome.value })
    } else {
      await createVendedor({ nome: nome.value })
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
      <CardTitle>{{ vendedor ? `Editar vendedor: ${vendedor.nome}` : 'Cadastrar vendedor' }}</CardTitle>
      <CardDescription v-if="vendedor">ID: {{ vendedor.id }}</CardDescription>
    </CardHeader>
    <form @submit.prevent="handleSubmit">
      <CardContent class="flex flex-col gap-1">
        <label for="nome" class="text-sm font-medium">Nome</label>
        <Input id="nome" v-model="nome" required />
        <p v-for="msg in fieldErrors.nome" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
      </CardContent>
      <CardFooter class="gap-2">
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Salvando...' : vendedor ? 'Salvar alterações' : 'Cadastrar' }}
        </Button>
        <Button type="button" variant="outline" @click="emit('cancel')">Cancelar</Button>
      </CardFooter>
    </form>
  </Card>
</template>
