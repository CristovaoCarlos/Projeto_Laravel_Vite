<script setup lang="ts">
import { computed } from 'vue'
import { LogOut, X } from '@lucide/vue'
import Button from '@/components/ui/Button.vue'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'
import type { Page } from '@/Dashboard.vue'

const props = defineProps<{
  active: Page
  isOpen: boolean
}>()

const emit = defineEmits<{
  navigate: [page: Page]
  close: []
}>()

const auth = useAuthStore()
const visibleItems = computed(() =>
  NAV_ITEMS.filter((item) => auth.user && item.tipos.includes(auth.user.tipo_usuario)),
)
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-30 bg-black/50 md:hidden" @click="emit('close')" />

  <aside
    :class="
      cn(
        'fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col gap-4 border-r border-border bg-card p-4 transition-transform duration-200 md:sticky md:top-0 md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )
    "
  >
    <div class="flex items-center justify-between gap-2 px-2">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium">{{ auth.user?.name }}</p>
        <p class="truncate text-xs text-muted-foreground">{{ auth.user?.email }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" class="text-destructive" title="Sair" @click="auth.logout()">
          <LogOut />
        </Button>
        <Button variant="ghost" size="icon" class="md:hidden" title="Fechar menu" @click="emit('close')">
          <X />
        </Button>
      </div>
    </div>

    <nav class="flex flex-col gap-1 overflow-y-auto">
      <Button
        v-for="item in visibleItems"
        :key="item.page"
        :variant="props.active === item.page ? 'secondary' : 'ghost'"
        class="justify-start"
        @click="emit('navigate', item.page)"
      >
        <component :is="item.icon" />
        {{ item.label }}
      </Button>
    </nav>
  </aside>
</template>
