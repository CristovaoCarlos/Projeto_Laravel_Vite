<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{ class?: string }>()
</script>

<template>
  <div
    data-slot="card-header"
    :class="cn('grid auto-rows-min items-start gap-1 px-4 has-[[data-slot=card-action]]:grid-cols-[1fr_auto]', $props.class)"
  >
    <slot />
  </div>
</template>
