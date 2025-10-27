import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '@/types'

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ORDER_STATUS_COLORS[status]} ${className}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </div>
  )
}
