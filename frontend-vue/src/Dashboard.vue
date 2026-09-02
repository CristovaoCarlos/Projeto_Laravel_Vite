<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import { NAV_ITEMS } from '@/components/layout/nav-items'
import ClientesPage from '@/pages/ClientesPage.vue'
import ProdutosPage from '@/pages/ProdutosPage.vue'
import PedidosPage from '@/pages/PedidosPage.vue'
import VendedoresPage from '@/pages/VendedoresPage.vue'
import LancarHistoricoPage from '@/pages/LancarHistoricoPage.vue'
import UsuariosPage from '@/pages/UsuariosPage.vue'

export type Page = 'clientes' | 'produtos' | 'pedidos' | 'vendedores' | 'historico' | 'usuarios'

const auth = useAuthStore()

const allowedPages = computed(() =>
  NAV_ITEMS.filter((item) => auth.user && item.tipos.includes(auth.user.tipo_usuario)).map((item) => item.page),
)

const requestedActive = ref<Page>('clientes')
const active = computed<Page>(() =>
  allowedPages.value.includes(requestedActive.value) ? requestedActive.value : (allowedPages.value[0] ?? requestedActive.value),
)

const pedidoClienteId = ref<number | null>(null)

function handleNavigate(page: Page) {
  pedidoClienteId.value = null
  requestedActive.value = page
}

function handleNewPedido(clienteId: number) {
  pedidoClienteId.value = clienteId
  requestedActive.value = 'pedidos'
}
</script>

<template>
  <DashboardLayout :active="active" @navigate="handleNavigate">
    <ClientesPage v-if="active === 'clientes'" @new-pedido="handleNewPedido" />
    <ProdutosPage v-else-if="active === 'produtos'" />
    <PedidosPage
      v-else-if="active === 'pedidos'"
      :initial-cliente-id="pedidoClienteId"
      @consume-initial-cliente-id="pedidoClienteId = null"
    />
    <VendedoresPage v-else-if="active === 'vendedores'" />
    <LancarHistoricoPage v-else-if="active === 'historico'" />
    <UsuariosPage v-else-if="active === 'usuarios'" />
  </DashboardLayout>
</template>
