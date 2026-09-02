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
import { ApiError, createProduto, updateProduto, type Produto } from '@/lib/api'

const props = defineProps<{
  produto: Produto | null
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const description = ref(props.produto?.description ?? '')
const price = ref(props.produto?.price ?? '')
const stock = ref(props.produto?.stock ?? 0)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

async function handleSubmit() {
  error.value = null
  fieldErrors.value = {}
  isSubmitting.value = true

  const data = {
    description: description.value,
    price: Number(price.value),
    stock: Number(stock.value),
  }

  try {
    if (props.produto) {
      await updateProduto(props.produto.id, data)
    } else {
      await createProduto(data)
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
      <CardTitle>{{ produto ? `Editar produto: ${produto.description}` : 'Cadastrar produto' }}</CardTitle>
      <CardDescription v-if="produto">ID: {{ produto.id }}</CardDescription>
    </CardHeader>
    <form @submit.prevent="handleSubmit">
      <CardContent class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label for="description" class="text-sm font-medium">Descrição</label>
          <Input id="description" v-model="description" required />
          <p v-for="msg in fieldErrors.description" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="price" class="text-sm font-medium">Preço</label>
          <Input id="price" v-model="price" type="number" step="0.01" min="0" required />
          <p v-for="msg in fieldErrors.price" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="stock" class="text-sm font-medium">Estoque</label>
          <Input id="stock" v-model="stock" type="number" min="0" required />
          <p v-for="msg in fieldErrors.stock" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <p v-if="error" class="text-sm text-destructive sm:col-span-2">{{ error }}</p>
      </CardContent>
      <CardFooter class="gap-2">
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Salvando...' : produto ? 'Salvar alterações' : 'Cadastrar' }}
        </Button>
        <Button type="button" variant="outline" @click="emit('cancel')">Cancelar</Button>
      </CardFooter>
    </form>
  </Card>
</template>
