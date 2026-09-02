<script setup lang="ts">
import { ref } from 'vue'
import { Menu } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import Sidebar from './Sidebar.vue'
import type { Page } from '@/Dashboard.vue'

defineProps<{ active: Page }>()

const emit = defineEmits<{
  navigate: [page: Page]
}>()

const isSidebarOpen = ref(false)

function handleNavigate(page: Page) {
  isSidebarOpen.value = false
  emit('navigate', page)
}
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <Sidebar :active="active" :is-open="isSidebarOpen" @navigate="handleNavigate" @close="isSidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-card p-3 md:hidden">
        <Button variant="ghost" size="icon" title="Abrir menu" @click="isSidebarOpen = true">
          <Menu />
        </Button>
        <span class="text-sm font-medium">Menu</span>
      </header>

      <main class="flex-1 overflow-auto p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
