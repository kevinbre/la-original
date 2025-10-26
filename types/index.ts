export type UserRole = 'admin' | 'customer'

export type OrderStatus =
  | 'pendiente'
  | 'confirmado'
  | 'en_preparacion'
  | 'preparado'
  | 'entregado'

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
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PriceList {
  id: string
  name: string
  description?: string
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
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  en_preparacion: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  preparado: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  entregado: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
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
