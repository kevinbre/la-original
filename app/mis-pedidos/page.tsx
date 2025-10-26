'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, FileText, MessageCircle, CheckCircle, AlertTriangle, ShoppingBag } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  status: string
  total: number
  created_at: string
  order_items?: any[]
}

export default function MisPedidosPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      toast.error('Debes iniciar sesión para ver tus pedidos')
      router.push('/login')
      return
    }

    setUser(session.user)
    loadOrders(session.user.id)
  }

  const loadOrders = async (userId: string) => {
    setLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          subtotal
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading orders:', error)
      toast.error('Error al cargar pedidos')
    } else {
      setOrders(data || [])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Mis Pedidos
        </h1>
        <p className="text-muted-foreground">
          Aquí podés ver el estado de todos tus pedidos
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <CardTitle className="mb-2">No hay pedidos</CardTitle>
            <CardDescription className="mb-6 text-center">
              Aún no has realizado ningún pedido
            </CardDescription>
            <Link href="/productos">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ver Productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Pedido {order.order_number}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(order.created_at).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </CardDescription>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium">Items del pedido</h4>
                    <div className="space-y-2 rounded-lg border p-3">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.product_name} <span className="font-medium">x {item.quantity}</span>
                          </span>
                          {item.unit_price && (
                            <span className="font-medium">
                              ${item.subtotal?.toFixed(2) || '0.00'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between border-t pt-3">
                    {order.total > 0 ? (
                      <>
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-lg font-bold">
                          ${order.total.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        Esperando presupuesto
                      </div>
                    )}
                  </div>

                  {/* Alert if rejected */}
                  {order.status === 'rechazado' && (
                    <div className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                      <div>
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          Presupuesto rechazado
                        </p>
                        <p className="mt-1 text-xs text-orange-700 dark:text-orange-300">
                          Nos pondremos en contacto contigo pronto
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success alert if confirmed */}
                  {order.status === 'confirmado' && (
                    <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Presupuesto confirmado
                        </p>
                        <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                          Tu pedido está siendo preparado
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  {order.status === 'presupuestado' && (
                    <Link href={`/pedidos/${order.id}/confirmar`} className="flex-1">
                      <Button className="w-full" size="lg">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Ver y Confirmar Presupuesto
                      </Button>
                    </Link>
                  )}

                  {order.status === 'pendiente' && (
                    <a
                      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hola! Tengo una consulta sobre mi pedido ${order.order_number}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full" size="lg">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Consultar por WhatsApp
                      </Button>
                    </a>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="mt-8 border-dashed">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿No encuentras tu pedido?{' '}
            <Link
              href="/buscar-pedido"
              className="font-medium text-primary hover:underline"
            >
              Búscalo con tu código
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
