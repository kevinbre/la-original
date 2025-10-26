'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { openWhatsAppWithOrder } from '@/lib/whatsapp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Package, Minus, Plus, Trash2, ArrowRight, User, Phone, Mail, Calendar, FileText, AlertCircle } from 'lucide-react'

export default function CarritoPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasIncompleteProfile, setHasIncompleteProfile] = useState(false)
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    delivery_date: '',
  })

  // Load user data if logged in
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setIsLoggedIn(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          const name = profile.full_name || ''
          const phone = profile.phone || ''

          setCustomerData({
            name,
            phone,
            email: profile.email || session.user.email || '',
            notes: '',
            delivery_date: '',
          })

          // Check if profile is incomplete
          setHasIncompleteProfile(!name || !phone)
        }
      }
    }

    loadUserData()
  }, [])

  const handleSaveProfileData = async () => {
    if (!customerData.name || !customerData.phone) {
      toast.error('Datos incompletos', {
        description: 'El nombre y teléfono son obligatorios'
      })
      return
    }

    setSavingProfile(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Debes iniciar sesión')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: customerData.name,
          phone: customerData.phone,
        })
        .eq('id', session.user.id)

      if (error) throw error

      toast.success('Datos guardados', {
        description: 'Tu perfil se ha actualizado correctamente'
      })
      setHasIncompleteProfile(false)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error('Error al guardar', {
        description: error.message
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!customerData.name || !customerData.phone || !customerData.delivery_date) {
      toast.error('Datos incompletos', {
        description: 'Por favor completa tu nombre, teléfono y fecha de entrega',
      })
      return
    }

    if (items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    setLoading(true)

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number')

      if (orderNumberError) throw orderNumberError

      // Generate guest token if not logged in
      let guestToken = null
        const { data: tokenData, error: tokenError } = await supabase
          .rpc('generate_guest_token')

        if (tokenError) throw tokenError
        guestToken = tokenData
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumberData,
          user_id: session?.user?.id || null,
          guest_token: guestToken,
          customer_name: customerData.name,
          customer_email: customerData.email || null,
          customer_phone: customerData.phone,
          notes: customerData.notes || null,
          delivery_date: customerData.delivery_date,
          status: 'pendiente',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_description: item.product.description || null,
        quantity: item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      clearCart()

      toast.success('¡Pedido creado exitosamente!', {
        description: `Tu número de pedido es ${orderNumberData}`,
        action: {
          label: 'Notificar por WhatsApp',
          onClick: () => openWhatsAppWithOrder(order.order_number, customerData.name, undefined, guestToken || undefined),
        },
      })

      // Redirect based on user status
      setTimeout(() => {
        if (session?.user) {
          router.push('/mis-pedidos')
        } else {
          router.push(`/pedido/${order.order_number}?token=${guestToken}`)
        }
      }, 1500)
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error('Error al crear el pedido', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-md border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="mb-4 h-24 w-24 text-muted-foreground" />
            <CardTitle className="mb-2 text-2xl">Tu carrito está vacío</CardTitle>
            <CardDescription className="mb-6 text-center">
              Agregá productos para comenzar tu pedido
            </CardDescription>
            <Link href="/productos">
              <Button size="lg">
                <Package className="mr-2 h-4 w-4" />
                Ver Productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Tu Carrito
        </h1>
        <p className="text-muted-foreground">
          Revisá tus productos y completá tu pedido
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.product.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  {item.product.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {item.product.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[2rem] text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.product.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Datos de Contacto</CardTitle>
              <CardDescription>
                Completá tus datos para procesar el pedido
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre completo <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={customerData.name}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, name: e.target.value })
                    }
                    placeholder="Juan Pérez"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, phone: e.target.value })
                    }
                    placeholder="+54 9 11 1234-5678"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_date" className="text-sm font-medium">
                  Fecha de Entrega <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="delivery_date"
                    type="date"
                    value={customerData.delivery_date}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, delivery_date: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>Coordinamos la entrega según disponibilidad</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email (opcional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, email: e.target.value })
                    }
                    placeholder="tu@email.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notas (opcional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="notes"
                    value={customerData.notes}
                    onChange={(e) =>
                      setCustomerData({ ...customerData, notes: e.target.value })
                    }
                    placeholder="Indicaciones especiales para tu pedido..."
                    className="pl-9 min-h-[80px]"
                    rows={3}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total de productos</span>
                  <Badge variant="secondary" className="text-base">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Los precios serán calculados y enviados en el presupuesto
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              {/* Save Profile Button (only for logged in users with incomplete profile) */}
              {isLoggedIn && hasIncompleteProfile && (
                <div className="w-full space-y-2">
                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-900 dark:text-amber-200">
                      Guarda estos datos en tu perfil para no tener que ingresarlos nuevamente
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveProfileData}
                    disabled={savingProfile}
                    variant="outline"
                    className="w-full"
                  >
                    {savingProfile ? (
                      'Guardando...'
                    ) : (
                      <>
                        <User className="mr-2 h-4 w-4" />
                        Guardar en mi Perfil
                      </>
                    )}
                  </Button>
                </div>
              )}

              <Button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  'Creando pedido...'
                ) : (
                  <>
                    Realizar Pedido
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Recibirás un presupuesto que deberás confirmar antes de la preparación
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
