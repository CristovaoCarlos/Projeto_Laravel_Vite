const API_URL = import.meta.env.VITE_API_URL as string

export type TipoUsuario = 'superadmin' | 'vendedor' | 'estoquista' | 'historico'

export type User = {
  id: number
  name: string
  email: string
  tipo_usuario: TipoUsuario
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
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
  tipo_usuario: TipoUsuario
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
  vendedor_id: number | null
  name: string
  email: string | null
  phone: string
  street: string
  number: string | null
  city: string
  state: string
  zip_code: string
  location: string | null
  created_at: string
  updated_at: string
  pedidos_count?: number
}

export type ClienteInput = {
  vendedor_id: number | null
  name: string
  email: string
  phone: string
  street: string
  number: string
  city: string
  state: string
  zip_code: string
  location: string
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
  description: string
  price: string
  stock: number
  created_at: string
  updated_at: string
}

export type ProdutoInput = {
  description: string
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

export type PedidoItem = {
  id: number
  pedido_id: number
  produto_id: number
  quantidade: number
  preco_unitario: string
  produto?: Produto
}

export type TipoPagamento = 'dinheiro' | 'cartao' | 'pix'
export type PedidoStatus = 'aguardando_pagamento' | 'pagamento_efetuado'

export type Pedido = {
  id: number
  cliente_id: number
  vendedor_id: number
  tipo_pagamento: TipoPagamento
  status: PedidoStatus
  comprovante_pagamento: string | null
  total: string
  created_at: string
  updated_at: string
  cliente?: Cliente
  itens?: PedidoItem[]
}

export type PedidoInput = {
  cliente_id: number
  vendedor_id: number
  tipo_pagamento: TipoPagamento
  status: PedidoStatus
  comprovante_pagamento?: File | null
  itens: { produto_id: number; quantidade: number }[]
}

export function comprovanteUrl(path: string): string {
  return `${API_URL}/storage/${path}`
}

function buildPedidoFormData(data: PedidoInput): FormData {
  const formData = new FormData()
  formData.append('cliente_id', String(data.cliente_id))
  formData.append('vendedor_id', String(data.vendedor_id))
  formData.append('tipo_pagamento', data.tipo_pagamento)
  formData.append('status', data.status)
  data.itens.forEach((item, index) => {
    formData.append(`itens[${index}][produto_id]`, String(item.produto_id))
    formData.append(`itens[${index}][quantidade]`, String(item.quantidade))
  })
  if (data.comprovante_pagamento) {
    formData.append('comprovante_pagamento', data.comprovante_pagamento)
  }
  return formData
}

export function listPedidos(): Promise<Pedido[]> {
  return apiFetch<Pedido[]>('/api/pedidos')
}

export function createPedido(data: PedidoInput): Promise<Pedido> {
  return apiFetch<Pedido>('/api/pedidos', { method: 'POST', body: buildPedidoFormData(data) })
}

export function updatePedido(id: number, data: PedidoInput): Promise<Pedido> {
  const formData = buildPedidoFormData(data)
  formData.append('_method', 'PUT')
  return apiFetch<Pedido>(`/api/pedidos/${id}`, { method: 'POST', body: formData })
}

export function deletePedido(id: number): Promise<void> {
  return apiFetch<void>(`/api/pedidos/${id}`, { method: 'DELETE' })
}

export type Vendedor = {
  id: number
  nome: string
  created_at: string
  updated_at: string
}

export type VendedorInput = {
  nome: string
}

export function listVendedores(): Promise<Vendedor[]> {
  return apiFetch<Vendedor[]>('/api/vendedores')
}

export function createVendedor(data: VendedorInput): Promise<Vendedor> {
  return apiFetch<Vendedor>('/api/vendedores', { method: 'POST', body: JSON.stringify(data) })
}

export function updateVendedor(id: number, data: VendedorInput): Promise<Vendedor> {
  return apiFetch<Vendedor>(`/api/vendedores/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteVendedor(id: number): Promise<void> {
  return apiFetch<void>(`/api/vendedores/${id}`, { method: 'DELETE' })
}

export type Historico = {
  id: number
  cliente_nome: string
  vendedor_id: number | null
  valor: string
  data_hora: string
  created_at: string
  updated_at: string
  vendedor?: Vendedor
}

export type HistoricoInput = {
  cliente_nome: string
  vendedor_id: number
  valor: number
  hora: string
}

export function listHistoricos(): Promise<Historico[]> {
  return apiFetch<Historico[]>('/api/historicos')
}

export function createHistorico(data: HistoricoInput): Promise<Historico> {
  return apiFetch<Historico>('/api/historicos', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteHistorico(id: number): Promise<void> {
  return apiFetch<void>(`/api/historicos/${id}`, { method: 'DELETE' })
}

export type UsuarioInput = {
  name: string
  email: string
  password?: string
  tipo_usuario: TipoUsuario
}

export function listUsuarios(): Promise<User[]> {
  return apiFetch<User[]>('/api/usuarios')
}

export function createUsuario(data: UsuarioInput): Promise<User> {
  return apiFetch<User>('/api/usuarios', { method: 'POST', body: JSON.stringify(data) })
}

export function updateUsuario(id: number, data: UsuarioInput): Promise<User> {
  return apiFetch<User>(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteUsuario(id: number): Promise<void> {
  return apiFetch<void>(`/api/usuarios/${id}`, { method: 'DELETE' })
}
