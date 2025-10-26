'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Search, Plus, Trash2, ShoppingCart, Calendar } from 'lucide-react'
import { Product } from '@/types'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address?: string
  city?: string
}

interface OrderItem {
  product: Product
  quantity: number
  customPrice: number
}

export default function CrearPedidoPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [openCustomer, setOpenCustomer] = useState(false)
  const [openProduct, setOpenProduct] = useState(false)
  const [searchCustomer, setSearchCustomer] = useState('')
  const [searchProduct, setSearchProduct] = useState('')

  useEffect(() => {
    loadCustomers()
    loadProducts()
  }, [])

  async function loadCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error loading customers:', error)
      toast.error('Error al cargar clientes')
      return
    }

    setCustomers(data || [])
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error loading products:', error)
      toast.error('Error al cargar productos')
      return
    }

    setProducts(data || [])
  }

  function addProductToOrder(product: Product) {
    // Check if product already in order
    const existing = orderItems.find(item => item.product.id === product.id)
    if (existing) {
      toast.error('Este producto ya está en el pedido')
      return
    }

    setOrderItems([...orderItems, {
      product,
      quantity: 1,
      customPrice: 0
    }])
    setOpenProduct(false)
    setSearchProduct('')
  }

  function removeProduct(productId: string) {
    setOrderItems(orderItems.filter(item => item.product.id !== productId))
  }

  function updateQuantity(productId: string, quantity: number) {
    setOrderItems(orderItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ))
  }

  function updatePrice(productId: string, price: number) {
    setOrderItems(orderItems.map(item =>
      item.product.id === productId
        ? { ...item, customPrice: Math.max(0, price) }
        : item
    ))
  }

  function calculateTotal() {
    return orderItems.reduce((sum, item) => {
      return sum + (item.customPrice * item.quantity)
    }, 0)
  }

  async function handleCreateOrder() {
    if (!selectedCustomer) {
      toast.error('Debes seleccionar un cliente')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Debes agregar al menos un producto')
      return
    }

    // Validate all items have prices
    const itemsWithoutPrice = orderItems.filter(item => item.customPrice <= 0)
    if (itemsWithoutPrice.length > 0) {
      toast.error('Todos los productos deben tener un precio mayor a 0')
      return
    }

    setLoading(true)

    try {
      const total = calculateTotal()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: selectedCustomer.name,
          customer_email: selectedCustomer.email || null,
          customer_phone: selectedCustomer.phone,
          customer_id: selectedCustomer.id,
          status: 'pendiente',
          notes: notes || null,
          delivery_date: deliveryDate || null,
          total,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const items = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_description: item.product.description || null,
        quantity: item.quantity,
        unit_price: item.customPrice,
        custom_price: item.customPrice,
        subtotal: item.customPrice * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items)

      if (itemsError) throw itemsError

      toast.success(`Pedido ${order.order_number} creado exitosamente`)
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Error al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.phone.includes(searchCustomer)
  )

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Crear Pedido</h1>
        <p className="text-muted-foreground">Crea un nuevo pedido para un cliente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Order form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer selection */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
              <CardDescription>Selecciona el cliente para este pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCustomer}
                    className="w-full justify-between"
                  >
                    {selectedCustomer ? selectedCustomer.name : 'Seleccionar cliente...'}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar cliente..."
                      value={searchCustomer}
                      onValueChange={setSearchCustomer}
                    />
                    <CommandEmpty>No se encontraron clientes</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          onSelect={() => {
                            setSelectedCustomer(customer)
                            setOpenCustomer(false)
                            setSearchCustomer('')
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name}</span>
                            <span className="text-sm text-muted-foreground">{customer.phone}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedCustomer && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm"><strong>Teléfono:</strong> {selectedCustomer.phone}</p>
                  {selectedCustomer.email && (
                    <p className="text-sm"><strong>Email:</strong> {selectedCustomer.email}</p>
                  )}
                  {selectedCustomer.city && (
                    <p className="text-sm"><strong>Ciudad:</strong> {selectedCustomer.city}</p>
                  )}
                  {selectedCustomer.address && (
                    <p className="text-sm"><strong>Dirección:</strong> {selectedCustomer.address}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products selection */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>Agrega productos al pedido y define sus precios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover open={openProduct} onOpenChange={setOpenProduct}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar producto..."
                      value={searchProduct}
                      onValueChange={setSearchProduct}
                    />
                    <CommandEmpty>No se encontraron productos</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredProducts.map((product) => (
                        <CommandItem
                          key={product.id}
                          onSelect={() => addProductToOrder(product)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            {product.description && (
                              <span className="text-sm text-muted-foreground">{product.description}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Order items list */}
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.product.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        {item.product.description && (
                          <p className="text-sm text-muted-foreground">{item.product.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`quantity-${item.product.id}`} className="text-xs">
                          Cantidad
                        </Label>
                        <Input
                          id={`quantity-${item.product.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${item.product.id}`} className="text-xs">
                          Precio Unitario ($)
                        </Label>
                        <Input
                          id={`price-${item.product.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.customPrice}
                          onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                          className="mt-1"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-right">
                      <span className="text-sm text-muted-foreground">Subtotal: </span>
                      <span className="font-semibold">${(item.customPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}

                {orderItems.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No hay productos agregados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="delivery-date">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Fecha de Entrega (Opcional)
                </Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas del Pedido (Opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Información adicional sobre el pedido..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{selectedCustomer?.name || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Productos:</span>
                  <span className="font-medium">{orderItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estado inicial:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">TOTAL:</span>
                  <span className="text-2xl font-bold">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCreateOrder}
                disabled={loading || !selectedCustomer || orderItems.length === 0}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {loading ? 'Creando...' : 'Crear Pedido'}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="w-full"
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
