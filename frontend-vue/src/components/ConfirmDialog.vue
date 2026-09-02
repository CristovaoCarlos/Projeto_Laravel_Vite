<script setup lang="ts">
import Button from '@/components/ui/Button.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    description: string
    confirmLabel?: string
    isConfirming?: boolean
    error?: string | null
  }>(),
  {
    confirmLabel: 'Excluir',
    isConfirming: false,
    error: null,
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
  confirm: []
}>()

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/50" @click="close" />
      <div
        role="alertdialog"
        aria-modal="true"
        class="fixed top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10"
      >
        <h2 class="text-base font-medium">{{ title }}</h2>
        <p class="mt-2 text-sm text-muted-foreground">{{ description }}</p>
        <p v-if="error" class="mt-3 text-sm text-destructive">{{ error }}</p>
        <div class="mt-6 flex justify-end gap-2">
          <Button variant="outline" @click="close">Cancelar</Button>
          <Button variant="destructive" :disabled="isConfirming" @click="emit('confirm')">
            {{ isConfirming ? 'Excluindo...' : confirmLabel }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
