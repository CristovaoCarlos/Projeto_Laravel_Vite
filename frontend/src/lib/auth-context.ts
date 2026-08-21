import { createContext } from 'react'
import type { User } from './api'

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (data: { email: string; password: string; remember?: boolean }) => Promise<void>
  register: (data: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
