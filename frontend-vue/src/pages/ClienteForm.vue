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
import { ApiError, createCliente, updateCliente, type Cliente, type Vendedor } from '@/lib/api'
import { formatCep, formatPhone } from '@/lib/format'
import { lookupCep } from '@/lib/viacep'

const props = defineProps<{
  cliente: Cliente | null
  vendedor: Vendedor[]
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const name = ref(props.cliente?.name ?? '')
const phone = ref(formatPhone(props.cliente?.phone ?? ''))
const email = ref(props.cliente?.email ?? '')
const street = ref(props.cliente?.street ?? '')
const number = ref(props.cliente?.number ?? '')
const city = ref(props.cliente?.city ?? '')
const state = ref(props.cliente?.state ?? '')
const zipCode = ref(formatCep(props.cliente?.zip_code ?? ''))
const location = ref(props.cliente?.location ?? '')
const vendedorId = ref(props.cliente?.vendedor_id ? String(props.cliente.vendedor_id) : '')

const isSubmitting = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})
const isLookingUpCep = ref(false)
const cepError = ref<string | null>(null)

function handlePhoneInput(event: Event) {
  phone.value = formatPhone((event.target as HTMLInputElement).value)
}

function handleCepInput(event: Event) {
  zipCode.value = formatCep((event.target as HTMLInputElement).value)
}

async function handleCepBlur() {
  const digits = zipCode.value.replace(/\D/g, '')
  if (digits.length !== 8) return

  cepError.value = null
  isLookingUpCep.value = true
  try {
    const result = await lookupCep(digits)
    if (!result) {
      cepError.value = 'CEP não encontrado.'
      return
    }
    street.value = result.street
    city.value = result.city
    state.value = result.state
  } catch {
    cepError.value = 'Não foi possível consultar o CEP.'
  } finally {
    isLookingUpCep.value = false
  }
}

function handleClear() {
  name.value = ''
  phone.value = ''
  email.value = ''
  street.value = ''
  number.value = ''
  city.value = ''
  state.value = ''
  zipCode.value = ''
  location.value = ''
  vendedorId.value = ''
  error.value = null
  fieldErrors.value = {}
  cepError.value = null
}

async function handleSubmit() {
  error.value = null
  fieldErrors.value = {}

  if (!vendedorId.value) {
    error.value = 'Selecione um vendedor.'
    return
  }

  isSubmitting.value = true

  const data = {
    name: name.value,
    phone: phone.value,
    email: email.value,
    street: street.value,
    number: number.value,
    city: city.value,
    state: state.value,
    zip_code: zipCode.value,
    location: location.value,
    vendedor_id: Number(vendedorId.value),
  }

  try {
    if (props.cliente) {
      await updateCliente(props.cliente.id, data)
    } else {
      await createCliente(data)
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
      <CardTitle>{{ cliente ? `Editar cliente: ${cliente.name}` : 'Cadastrar cliente' }}</CardTitle>
      <CardDescription v-if="cliente">ID: {{ cliente.id }}</CardDescription>
    </CardHeader>
    <form @submit.prevent="handleSubmit">
      <CardContent class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label for="name" class="flex items-center gap-2 border-l-4 border-destructive pl-2 text-sm font-medium">
            Nome <span class="text-destructive">*</span>
          </label>
          <Input id="name" v-model="name" required />
          <p v-for="msg in fieldErrors.name" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label for="phone" class="flex items-center gap-2 border-l-4 border-destructive pl-2 text-sm font-medium">
            Telefone <span class="text-destructive">*</span>
          </label>
          <Input
            id="phone"
            v-model="phone"
            required
            placeholder="(XX) XXXXX-XXXX"
            maxlength="15"
            pattern="^\(\d{2}\) \d{5}-\d{4}$"
            title="Formato: (XX) XXXXX-XXXX"
            @input="handlePhoneInput"
          />
          <p v-for="msg in fieldErrors.phone" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">Email</label>
          <Input id="email" v-model="email" type="email" />
          <p v-for="msg in fieldErrors.email" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label for="street" class="flex items-center gap-2 border-l-4 border-destructive pl-2 text-sm font-medium">
            Rua <span class="text-destructive">*</span>
          </label>
          <Input id="street" v-model="street" required />
          <p v-for="msg in fieldErrors.street" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="number" class="flex items-center gap-2 border-l-4 border-destructive pl-2 text-sm font-medium">
            Número <span class="text-destructive">*</span>
          </label>
          <Input id="number" v-model="number" required />
          <p v-for="msg in fieldErrors.number" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label for="city" class="flex items-center gap-2 border-l-4 border-destructive pl-2 text-sm font-medium">
            Cidade <span class="text-destructive">*</span>
          </label>
          <Input id="city" v-model="city" required />
          <p v-for="msg in fieldErrors.city" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="state" class="flex items-center gap-2 border-l-4 border-destructive pl-2 text-sm font-medium">
            Estado <span class="text-destructive">*</span>
          </label>
          <Input id="state" v-model="state" required />
          <p v-for="msg in fieldErrors.state" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label for="zip_code" class="flex items-center gap-2 border-l-4 border-destructive pl-2 text-sm font-medium">
            CEP <span class="text-destructive">*</span>
          </label>
          <Input
            id="zip_code"
            v-model="zipCode"
            required
            placeholder="00000-000"
            maxlength="9"
            pattern="^\d{5}-\d{3}$"
            title="Formato: 00000-000"
            @input="handleCepInput"
            @blur="handleCepBlur"
          />
          <p v-if="isLookingUpCep" class="text-xs text-muted-foreground">Buscando endereço...</p>
          <p v-if="cepError" class="text-xs text-destructive">{{ cepError }}</p>
          <p v-for="msg in fieldErrors.zip_code" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>
        <div class="flex flex-col gap-1">
          <label for="location" class="text-sm font-medium">Localização (Google Maps)</label>
          <Input
            id="location"
            v-model="location"
            placeholder="-23.550520, -46.633309"
            pattern="^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$"
            title="Formato: latitude, longitude (ex: -23.550520, -46.633309)"
          />
          <p v-for="msg in fieldErrors.location" :key="msg" class="text-xs text-destructive">{{ msg }}</p>
        </div>

        <div class="flex flex-col gap-1">
          <label for="vendedor_id" class="text-sm font-medium">Vendedor</label>
          <select
            id="vendedor_id"
            v-model="vendedorId"
            class="h-8 rounded-lg border border-border bg-background px-2.5 text-sm"
          >
            <option value="">Selecione...</option>
            <option v-for="v in vendedor" :key="v.id" :value="String(v.id)">{{ v.nome }}</option>
          </select>
        </div>

        <p v-if="error" class="text-sm text-destructive sm:col-span-2">{{ error }}</p>
      </CardContent>
      <CardFooter class="gap-2">
        <Button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Salvando...' : cliente ? 'Salvar alterações' : 'Cadastrar' }}
        </Button>
        <Button v-if="!cliente" type="button" variant="outline" @click="handleClear">Limpar formulário</Button>
        <Button type="button" variant="outline" @click="emit('cancel')">Cancelar</Button>
      </CardFooter>
    </form>
  </Card>
</template>
