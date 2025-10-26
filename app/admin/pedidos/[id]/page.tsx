'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { OrderWithItems, PriceList, ORDER_STATUS_LABELS, Profile } from '@/types'
import { toast } from 'sonner'
import { downloadInvoicePDF } from '@/lib/pdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HorizontalStatusStepper } from '@/components/horizontal-status-stepper'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Download,
  Save,
  X,
  User,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  ChevronRight,
  XCircle
} from 'lucide-react'

const STATUS_FLOW = [
  'pendiente',
  'en_revision',
  'presupuestado',
  'confirmado',
  'en_preparacion',
  'listo_entrega',
  'completado',
]

export default function AdminPedidoDetallePage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [priceLists, setPriceLists] = useState<PriceList[]>([])
  const [loading, setLoading] = useState(true)
  const [customPrices, setCustomPrices] = useState<{ [key: string]: string }>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedPriceList, setSelectedPriceList] = useState<string>('')
  const [applyingPriceList, setApplyingPriceList] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    checkAdmin()
    loadOrder()
    loadPriceLists()
  }, [orderId])

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!profileData || profileData.role !== 'admin') {
      toast.error('No tenés permisos de administrador')
      router.push('/')
      return
    }

    setProfile(profileData)
  }

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
      toast.error('Error al cargar pedido')
      router.push('/admin')
    } else {
      const orderData: OrderWithItems = {
        ...data,
        items: data.order_items || []
      }
      setOrder(orderData)

      const prices: { [key: string]: string } = {}
      data.order_items?.forEach((item: any) => {
        prices[item.id] = item.custom_price?.toString() || item.unit_price?.toString() || ''
      })
      setCustomPrices(prices)
    }

    setLoading(false)
  }

  const loadPriceLists = async () => {
    const { data } = await supabase
      .from('price_lists')
      .select('*')
      .eq('is_active', true)

    if (data) {
      setPriceLists(data)
    }
  }

  const getNextStatus = () => {
    if (!order) return null
    const currentIndex = STATUS_FLOW.indexOf(order.status)
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return null
    return STATUS_FLOW[currentIndex + 1]
  }

  const advanceToNextStep = async () => {
    const nextStatus = getNextStatus()
    if (!nextStatus) return

    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', order!.id)

    if (error) {
      toast.error('Error al avanzar estado')
    } else {
      toast.success('Pedido avanzado al siguiente paso')
      loadOrder()
    }
  }

  const handleReject = async () => {
    if (!order || !rejectReason.trim()) {
      toast.error('Debes ingresar un motivo de rechazo')
      return
    }

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'rechazado',
        quote_rejected_at: new Date().toISOString(),
        quote_rejected_reason: rejectReason
      })
      .eq('id', order.id)

    if (error) {
      toast.error('Error al rechazar pedido')
    } else {
      toast.success('Pedido rechazado')
      setShowRejectDialog(false)
      setRejectReason('')
      loadOrder()
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)

    if (error) {
      toast.error('Error al actualizar estado')
    } else {
      toast.success('Estado actualizado correctamente')
      loadOrder()
    }
  }

  const applyPriceList = async () => {
    if (!order || !selectedPriceList) return

    setApplyingPriceList(true)

    try {
      const { data: priceData } = await supabase
        .from('product_prices')
        .select('product_id, price')
        .eq('price_list_id', selectedPriceList)

      if (!priceData) {
        toast.error('No se encontraron precios para esta lista')
        return
      }

      const priceMap = new Map(priceData.map(p => [p.product_id, p.price]))

      const updates = order.items.map(async (item) => {
        const price = priceMap.get(item.product_id)
        if (price) {
          return supabase
            .from('order_items')
            .update({
              unit_price: price,
              subtotal: price * item.quantity,
            })
            .eq('id', item.id)
        }
      })

      await Promise.all(updates.filter(Boolean))

      const total = order.items.reduce((sum, item) => {
        const price = priceMap.get(item.product_id) || 0
        return sum + (price * item.quantity)
      }, 0)

      await supabase
        .from('orders')
        .update({
          price_list_id: selectedPriceList,
          total,
        })
        .eq('id', order.id)

      toast.success('Lista de precios aplicada correctamente')
      loadOrder()
    } catch (error) {
      console.error('Error applying price list:', error)
      toast.error('Error al aplicar lista de precios')
    } finally {
      setApplyingPriceList(false)
    }
  }

  const reopenOrder = async () => {
    if (!order) return

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'en_revision',
        quote_rejected_at: null,
        quote_rejected_reason: null
      })
      .eq('id', order.id)

    if (error) {
      toast.error('Error al reabrir pedido')
    } else {
      toast.success('Pedido reabierto para revisión')
      loadOrder()
    }
  }

  const handlePriceChange = (itemId: string, price: string) => {
    setCustomPrices({ ...customPrices, [itemId]: price })
    setHasChanges(true)
  }

  const saveAllPrices = async () => {
    if (!order) return

    setSaving(true)

    try {
      const updates = []
      let newTotal = 0

      for (const item of order.items) {
        const priceStr = customPrices[item.id]
        const numPrice = parseFloat(priceStr)

        if (!isNaN(numPrice) && numPrice >= 0) {
          const subtotal = numPrice * item.quantity

          updates.push(
            supabase
              .from('order_items')
              .update({
                custom_price: numPrice,
                unit_price: numPrice,
                subtotal,
              })
              .eq('id', item.id)
          )

          newTotal += subtotal
        } else {
          newTotal += item.subtotal || 0
        }
      }

      const results = await Promise.all(updates)

      const errors = results.filter(r => r.error)
      if (errors.length > 0) {
        throw new Error('Error al actualizar algunos precios')
      }

      await supabase
        .from('orders')
        .update({ total: newTotal })
        .eq('id', order.id)

      toast.success('Precios guardados correctamente')
      setHasChanges(false)
      loadOrder()
    } catch (error) {
      console.error('Error saving prices:', error)
      toast.error('Error al guardar precios')
    } finally {
      setSaving(false)
    }
  }

  const cancelChanges = () => {
    const originalPrices: { [key: string]: string } = {}
    order?.items.forEach((item: any) => {
      originalPrices[item.id] = item.custom_price?.toString() || item.unit_price?.toString() || ''
    })
    setCustomPrices(originalPrices)
    setHasChanges(false)
  }

  const handleDownloadPDF = () => {
    if (order) {
      downloadInvoicePDF(order, 'order')
      toast.success('Descargando factura PDF...')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-8 h-6 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!order) return null

  const allItemsHavePrices = order.items.every(item =>
    item.unit_price !== null || item.custom_price !== null
  )

  const nextStatus = getNextStatus()
  const nextStatusLabel = nextStatus ? ORDER_STATUS_LABELS[nextStatus as keyof typeof ORDER_STATUS_LABELS] : null

  return (
    <div className="container mx-auto px-4 py-6 lg:py-12">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel
          </Button>
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold lg:text-3xl">
              Pedido {order.order_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              Creado el {new Date(order.created_at).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasChanges && (
              <>
                <Button
                  variant="outline"
                  onClick={cancelChanges}
                  disabled={saving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={saveAllPrices}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Guardando...' : 'Guardar Precios'}
                </Button>
              </>
            )}
            {allItemsHavePrices && !hasChanges && (
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Stepper */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estado del Pedido</CardTitle>
            <div className="flex gap-2">
              {order.status !== 'rechazado' && order.status !== 'cancelado' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar
                </Button>
              )}
              {nextStatus && order.status !== 'rechazado' && order.status !== 'cancelado' && (
                <Button
                  size="sm"
                  onClick={advanceToNextStep}
                >
                  Siguiente: {nextStatusLabel}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <HorizontalStatusStepper currentStatus={order.status} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Customer Info & Controls */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Código de Pedido</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-2 py-1 text-xs font-mono">
                    {order.order_number}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(order.order_number)
                      toast.success('Código copiado')
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Token de Acceso</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-2 py-1 text-xs font-mono">
                    {order.guest_token}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(order?.guest_token ?? "")
                      toast.success('Token copiado')
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              {order.notes && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Notas del cliente
                  </Label>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Control */}
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Estado Manualmente</CardTitle>
              <CardDescription>
                Estado actual:{' '}
                <Badge variant="secondary" className="ml-1">
                  {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={order.status} onValueChange={updateOrderStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Special Alerts */}
          {order.status === 'rechazado' && order.quote_rejected_reason && (
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                  <AlertTriangle className="h-5 w-5" />
                  Presupuesto Rechazado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-red-700 dark:text-red-300">Motivo:</Label>
                  <p className="text-sm text-red-900 dark:text-red-100">{order.quote_rejected_reason}</p>
                </div>
                <Button
                  onClick={reopenOrder}
                  className="w-full"
                  variant="outline"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reabrir Pedido
                </Button>
              </CardContent>
            </Card>
          )}

          {order.status === 'confirmado' && order.quote_confirmed_at && (
            <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                  <CheckCircle className="h-5 w-5" />
                  Presupuesto Confirmado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 dark:text-green-300">
                  El cliente confirmó el presupuesto el{' '}
                  {new Date(order.quote_confirmed_at).toLocaleDateString('es-AR')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Price List Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Aplicar Lista de Precios</CardTitle>
              <CardDescription>
                {order.price_list_id && (
                  <>
                    Lista actual:{' '}
                    <Badge variant="secondary" className="ml-1">
                      {priceLists.find(l => l.id === order.price_list_id)?.name || 'N/A'}
                    </Badge>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedPriceList} onValueChange={setSelectedPriceList}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar lista..." />
                </SelectTrigger>
                <SelectContent>
                  {priceLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                      {order.price_list_id === list.id && ' (Actual)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={applyPriceList}
                disabled={!selectedPriceList || applyingPriceList}
                className="w-full"
              >
                {applyingPriceList ? 'Aplicando...' : 'Aplicar Lista de Precios'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Items & Notes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Items del Pedido</CardTitle>
              <CardDescription>
                Total de {order.items.length} producto{order.items.length !== 1 && 's'}
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
                        <TableCell className="font-medium">
                          {item.product_name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.quantity}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={customPrices[item.id] || ''}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            className="max-w-[120px] ml-auto text-right"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${item.subtotal?.toFixed(2) || '0.00'}
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
                        ${order.total?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Privadas (Admin)</CardTitle>
              <CardDescription>
                Estas notas solo son visibles para administradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={order.admin_notes || ''}
                onChange={async (e) => {
                  const { error } = await supabase
                    .from('orders')
                    .update({ admin_notes: e.target.value })
                    .eq('id', order.id)

                  if (!error) {
                    setOrder({ ...order, admin_notes: e.target.value })
                    toast.success('Nota guardada')
                  }
                }}
                rows={4}
                placeholder="Notas internas que solo ve el admin..."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Pedido</DialogTitle>
            <DialogDescription>
              Ingresá el motivo por el cual rechazás este pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject-reason">Motivo de rechazo *</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Stock insuficiente, producto discontinuado..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectReason('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Rechazar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
