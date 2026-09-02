<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AuthForm from '@/AuthForm.vue'
import Dashboard from '@/Dashboard.vue'

const auth = useAuthStore()

onMounted(() => {
  auth.fetchUser()
})
</script>

<template>
  <div v-if="auth.isLoading" class="flex min-h-screen items-center justify-center bg-background p-4">
    <p class="text-sm text-muted-foreground">Carregando...</p>
  </div>

  <Dashboard v-else-if="auth.user" />

  <div v-else class="flex min-h-screen items-center justify-center bg-background p-4">
    <AuthForm />
  </div>
</template>
