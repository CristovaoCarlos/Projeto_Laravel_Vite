import { defineStore } from 'pinia'
import {
  ApiError,
  getUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  type TipoUsuario,
  type User,
} from '@/lib/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoading: true,
  }),
  actions: {
    async fetchUser() {
      this.isLoading = true
      try {
        this.user = await getUser()
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error(error)
        }
        this.user = null
      } finally {
        this.isLoading = false
      }
    },

    async login(data: { email: string; password: string; remember?: boolean }) {
      this.user = await apiLogin(data)
    },

    async register(data: {
      name: string
      email: string
      password: string
      password_confirmation: string
      tipo_usuario: TipoUsuario
    }) {
      this.user = await apiRegister(data)
    },

    async logout() {
      await apiLogout()
      this.user = null
    },
  },
})
