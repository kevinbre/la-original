'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { OrderWithItems, ORDER_STATUS_LABELS } from '@/types'
import { toast } from 'sonner'
import { downloadInvoicePDF } from '@/lib/pdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HorizontalStatusStepper } from '@/components/horizontal-status-stepper'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  Copy,
  Check,
  Download,
} from 'lucide-react'

export default function PedidoDetallePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const orderNumber = params.id as string
  const token = searchParams.get('token')

  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderNumber, token])

  const loadOrder = async () => {
    try {
      setLoading(true)

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession()

      // Build query
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            custom_price,
            subtotal
          )
        `)
        .eq('order_number', orderNumber.toUpperCase())

      // If user is logged in, check if order belongs to them
      if (session?.user) {
        const { data: orderData, error: orderError } = await query
          .eq('user_id', session.user.id)
          .single()

        if (!orderError && orderData) {
          setOrder(orderData as OrderWithItems)
          setIsAuthenticated(true)
          setLoading(false)
          return
        }
      }

      // If not logged in or order doesn't belong to user, check token
      if (!token) {
        toast.error('Acceso denegado', {
          description: 'Necesitas un token de acceso para ver este pedido'
        })
        router.push('/buscar-pedido')
        return
      }

      const { data: orderData, error: orderError } = await query
        .eq('guest_token', token.toUpperCase())
        .single()

      if (orderError || !orderData) {
        toast.error('Pedido no encontrado', {
          description: 'Verifica el número de pedido y el token de acceso'
        })
        router.push('/buscar-pedido')
        return
      }

      setOrder(orderData as OrderWithItems)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error loading order:', error)
      toast.error('Error al cargar el pedido')
      router.push('/buscar-pedido')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success(`${type} copiado al portapapeles`)
    setTimeout(() => setCopied(null), 2000)
  }

  const calculateTotal = () => {
    if (!order?.order_items) return 0
    return order.order_items.reduce((sum, item) => {
      const price = item.custom_price || item.unit_price || 0
      return sum + price * item.quantity
    }, 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownloadPDF = () => {
    if (!order) return

    // Convert order to have the required items structure for PDF
    const orderForPDF = {
      ...order,
      items: order.order_items,
      total: calculateTotal(),
    }

    downloadInvoicePDF(orderForPDF, 'order')
    toast.success('Presupuesto descargado', {
      description: 'El PDF se ha descargado correctamente'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Pedido no encontrado</h2>
        <p className="mt-2 text-muted-foreground">
          No se pudo encontrar el pedido solicitado
        </p>
        <Link href="/buscar-pedido">
          <Button className="mt-4">Buscar otro pedido</Button>
        </Link>
      </div>
    )
  }

  const total = calculateTotal()
  const hasPrecios = order.order_items.some(item => item.unit_price || item.custom_price)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/mis-pedidos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Detalle del Pedido
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {hasPrecios && (
            <Button onClick={handleDownloadPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          )}
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground hidden sm:inline">Pedido Verificado</span>
          </div>
        </div>
      </div>

      {/* Order Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                Pedido #{order.order_number}
              </CardTitle>
              <CardDescription className="mt-2">
                Creado el {formatDate(order.created_at)}
              </CardDescription>
            </div>
            <Badge variant={order.status === 'completado' ? 'default' : 'secondary'} className="text-sm">
              {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Access Info */}
          {token && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-3 text-sm font-semibold">Información de Acceso</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Código de Pedido</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-background px-2 py-1 text-xs font-mono">
                      {order.order_number}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleCopy(order.order_number, 'Código')}
                    >
                      {copied === 'Código' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Token de Acceso</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-background px-2 py-1 text-xs font-mono">
                      {token}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleCopy(token, 'Token')}
                    >
                      {copied === 'Token' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Guarda estos datos para consultar tu pedido en el futuro
              </p>
            </div>
          )}

          {/* Status Stepper */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Estado del Pedido</h3>
            <HorizontalStatusStepper currentStatus={order.status} />
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Datos de Contacto</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_phone}</span>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer_email}</span>
                </div>
              )}
              {order.delivery_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Entrega: {new Date(order.delivery_date).toLocaleDateString('es-AR')}</span>
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Notas del Pedido</h3>
                </div>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>
            {order.order_items.length} producto{order.order_items.length !== 1 ? 's' : ''} en este pedido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                {hasPrecios && (
                  <>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items.map((item) => {
                const price = item.custom_price || item.unit_price
                const subtotal = price ? price * item.quantity : null

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    {hasPrecios && (
                      <>
                        <TableCell className="text-right">
                          {price ? `$${price.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {subtotal ? `$${subtotal.toFixed(2)}` : '-'}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {hasPrecios ? (
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed bg-muted/50 p-6 text-center">
              <Package className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Presupuesto Pendiente</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Los precios serán agregados cuando tu pedido sea presupuestado
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
