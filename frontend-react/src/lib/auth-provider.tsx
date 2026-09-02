import { useEffect, useState, type ReactNode } from 'react'
import {
  ApiError,
  getUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  type TipoUsuario,
  type User,
} from './api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getUser()
      .then(setUser)
      .catch((error) => {
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error(error)
        }
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(data: { email: string; password: string; remember?: boolean }) {
    setUser(await apiLogin(data))
  }

  async function register(data: {
    name: string
    email: string
    password: string
    password_confirmation: string
    tipo_usuario: TipoUsuario
  }) {
    setUser(await apiRegister(data))
  }

  async function logout() {
    await apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
