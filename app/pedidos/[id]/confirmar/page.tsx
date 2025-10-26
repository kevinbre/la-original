'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { OrderWithItems, ORDER_STATUS_LABELS } from '@/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Package, Phone, Mail, User, Download, ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { downloadInvoicePDF } from '@/lib/pdf'

export default function ConfirmarPresupuestoPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    setLoading(true)

    const { data, error } = await supabase
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
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Error loading order:', error)
      toast.error('Error al cargar el pedido')
      router.push('/')
    } else {
      const orderData: OrderWithItems = {
        ...data,
        items: data.order_items || []
      }
      setOrder(orderData)

      // Verificar que el pedido está en estado correcto
      if (data.status !== 'presupuestado') {
        toast.info('Este presupuesto ya fue procesado')
        router.push('/mis-pedidos')
      }
    }

    setLoading(false)
  }

  const handleConfirm = async () => {
    if (!order) return

    setProcessing(true)

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'confirmado',
          quote_confirmed_at: new Date().toISOString()
        })
        .eq('id', order.id)

      if (error) throw error

      toast.success('¡Presupuesto confirmado!', {
        description: 'El equipo preparará tu pedido pronto'
      })

      setTimeout(() => {
        router.push('/mis-pedidos')
      }, 2000)
    } catch (error) {
      console.error('Error confirming:', error)
      toast.error('Error al confirmar presupuesto')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!order) return

    if (!rejectReason.trim()) {
      toast.error('Por favor indica el motivo del rechazo')
      return
    }

    setProcessing(true)

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'rechazado',
          quote_rejected_at: new Date().toISOString(),
          quote_rejected_reason: rejectReason
        })
        .eq('id', order.id)

      if (error) throw error

      toast.success('Presupuesto rechazado', {
        description: 'Nos pondremos en contacto contigo'
      })

      setTimeout(() => {
        router.push('/mis-pedidos')
      }, 2000)
    } catch (error) {
      console.error('Error rejecting:', error)
      toast.error('Error al rechazar presupuesto')
    } finally {
      setProcessing(false)
    }
  }

  const handleDownloadPDF = () => {
    if (order) {
      downloadInvoicePDF(order, 'quote')
      toast.success('Descargando presupuesto en PDF...')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 lg:py-12">
      <div className="mb-6">
        <Link href="/mis-pedidos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Pedidos
          </Button>
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold lg:text-3xl">Presupuesto Listo</h1>
            <p className="text-sm text-muted-foreground">
              Pedido {order.order_number} ·{' '}
              {new Date(order.created_at).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Información del cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Nombre</Label>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Teléfono
                </Label>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
              {order.customer_email && (
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items del presupuesto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalle del Presupuesto
            </CardTitle>
            <CardDescription>
              Revisa los productos y precios de tu pedido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.unit_price?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.subtotal?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      TOTAL
                    </TableCell>
                    <TableCell className="text-right text-lg font-bold">
                      ${order.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        {!rejecting ? (
          <Card>
            <CardHeader>
              <CardTitle>¿Qué deseas hacer?</CardTitle>
              <CardDescription>
                Puedes confirmar el presupuesto o rechazarlo si necesitas ajustes
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setRejecting(true)}
                disabled={processing}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar Presupuesto
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={processing}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {processing ? 'Confirmando...' : 'Confirmar Presupuesto'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Rechazar Presupuesto</CardTitle>
              <CardDescription className="text-orange-700">
                Por favor cuéntanos por qué no te convence este presupuesto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ejemplo: Los precios están muy altos, necesito que revisen el pedido..."
                rows={4}
                className="bg-white"
              />
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setRejecting(false)}
                disabled={processing}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing || !rejectReason.trim()}
              >
                {processing ? 'Rechazando...' : 'Confirmar Rechazo'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Nota:</strong> Al confirmar el presupuesto, nuestro equipo comenzará a preparar tu pedido.
          Si lo rechazas, nos pondremos en contacto contigo para ajustar los detalles.
        </p>
      </div>
    </div>
  )
}
