const API_URL = import.meta.env.VITE_API_URL as string

export type User = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

async function ensureCsrfCookie() {
  if (getCookie('XSRF-TOKEN')) return
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: 'include' })
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method?.toUpperCase() ?? 'GET'
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (method !== 'GET' && method !== 'HEAD') {
    await ensureCsrfCookie()
    const token = getCookie('XSRF-TOKEN')
    if (token) headers['X-XSRF-TOKEN'] = token
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    let message = response.statusText
    let errors: Record<string, string[]> | undefined
    try {
      const body = await response.json()
      message = body.message ?? message
      errors = body.errors
    } catch {
      // response had no JSON body
    }
    throw new ApiError(message, response.status, errors)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export function register(data: {
  name: string
  email: string
  password: string
  password_confirmation: string
}): Promise<User> {
  return apiFetch<User>('/api/register', { method: 'POST', body: JSON.stringify(data) })
}

export function login(data: { email: string; password: string; remember?: boolean }): Promise<User> {
  return apiFetch<User>('/api/login', { method: 'POST', body: JSON.stringify(data) })
}

export function logout(): Promise<void> {
  return apiFetch<void>('/api/logout', { method: 'POST' })
}

export function getUser(): Promise<User> {
  return apiFetch<User>('/api/user')
}

export type Cliente = {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export type ClienteInput = {
  name: string
  email: string
  phone: string
  address: string
}

export function listClientes(): Promise<Cliente[]> {
  return apiFetch<Cliente[]>('/api/clientes')
}

export function createCliente(data: ClienteInput): Promise<Cliente> {
  return apiFetch<Cliente>('/api/clientes', { method: 'POST', body: JSON.stringify(data) })
}

export function updateCliente(id: number, data: ClienteInput): Promise<Cliente> {
  return apiFetch<Cliente>(`/api/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteCliente(id: number): Promise<void> {
  return apiFetch<void>(`/api/clientes/${id}`, { method: 'DELETE' })
}

export type Produto = {
  id: number
  name: string
  description: string | null
  price: string
  stock: number
  created_at: string
  updated_at: string
}

export type ProdutoInput = {
  name: string
  description: string | null
  price: number
  stock: number
}

export function listProdutos(): Promise<Produto[]> {
  return apiFetch<Produto[]>('/api/produtos')
}

export function createProduto(data: ProdutoInput): Promise<Produto> {
  return apiFetch<Produto>('/api/produtos', { method: 'POST', body: JSON.stringify(data) })
}

export function updateProduto(id: number, data: ProdutoInput): Promise<Produto> {
  return apiFetch<Produto>(`/api/produtos/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteProduto(id: number): Promise<void> {
  return apiFetch<void>(`/api/produtos/${id}`, { method: 'DELETE' })
}

export type VendaItem = {
  id: number
  venda_id: number
  produto_id: number
  quantidade: number
  preco_unitario: string
  produto?: Produto
}

export type Venda = {
  id: number
  cliente_id: number
  total: string
  created_at: string
  updated_at: string
  cliente?: Cliente
  itens?: VendaItem[]
}

export type VendaInput = {
  cliente_id: number
  itens: { produto_id: number; quantidade: number }[]
}

export function listVendas(): Promise<Venda[]> {
  return apiFetch<Venda[]>('/api/vendas')
}

export function createVenda(data: VendaInput): Promise<Venda> {
  return apiFetch<Venda>('/api/vendas', { method: 'POST', body: JSON.stringify(data) })
}

export function updateVenda(id: number, data: VendaInput): Promise<Venda> {
  return apiFetch<Venda>(`/api/vendas/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteVenda(id: number): Promise<void> {
  return apiFetch<void>(`/api/vendas/${id}`, { method: 'DELETE' })
}
