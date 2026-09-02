<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{ class?: string }>()
const model = defineModel<string | number>()
</script>

<template>
  <input
    v-model="model"
    data-slot="input"
    :class="
      cn(
        'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80',
        $props.class,
      )
    "
  />
</template>
