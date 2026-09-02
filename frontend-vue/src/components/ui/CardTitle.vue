<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{ class?: string }>()
</script>

<template>
  <div data-slot="card-title" :class="cn('font-heading text-base leading-snug font-medium', $props.class)">
    <slot />
  </div>
</template>
