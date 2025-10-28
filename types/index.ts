export type UserRole = 'admin' | 'empleado' | 'customer'

export type OrderStatus =
  | 'pendiente'
  | 'confirmado'
  | 'en_preparacion'
  | 'preparado'
  | 'entregado'
  | 'rechazado'
  | 'cancelado'

export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category?: string
  image_url?: string
  unit: string
  units_per_pack?: number
  origin?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PriceList {
  id: string
  name: string
  description?: string
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductPrice {
  id: string
  product_id: string
  price_list_id: string
  price: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  guest_token?: string
  customer_name: string
  customer_email?: string
  customer_phone: string
  status: OrderStatus
  price_list_id?: string
  notes?: string
  admin_notes?: string
  total: number
  whatsapp_notified: boolean
  quote_rejected_at?: string
  quote_rejected_reason?: string
  quote_confirmed_at?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_description?: string
  quantity: number
  unit_price?: number
  custom_price?: number
  subtotal?: number
  created_at: string
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
  price_list_name?: string
  order_items?: any
  delivery_date: any
}

export interface Invoice {
  id: string
  invoice_number: string
  order_id?: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  pdf_url?: string
  created_by: string
  created_at: string
}

export interface InvoiceItem {
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  preparado: 'Preparado',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
  cancelado: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-yellow-500 text-white dark:bg-yellow-600 dark:text-white',
  confirmado: 'bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white',
  en_preparacion: 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white',
  preparado: 'bg-green-600 text-white dark:bg-green-700 dark:text-white',
  entregado: 'bg-green-700 text-white dark:bg-green-800 dark:text-white',
  rechazado: 'bg-red-600 text-white dark:bg-red-700 dark:text-white',
  cancelado: 'bg-gray-600 text-white dark:bg-gray-700 dark:text-white',
}

export interface AdminNotification {
  id: string
  order_id?: string
  type: 'quote_confirmed' | 'quote_rejected' | 'new_order'
  title: string
  message: string
  read: boolean
  created_at: string
  // From view
  order_number?: string
  customer_name?: string
  customer_phone?: string
  total?: number
  order_status?: OrderStatus
}
