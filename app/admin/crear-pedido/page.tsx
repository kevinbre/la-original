'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Trash2, ShoppingCart, Calendar, UserPlus, DollarSign, Check } from 'lucide-react'
import { Product } from '@/types'

interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address?: string
  city?: string
}

interface PriceList {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProductPrice {
  id: string
  product_id: string
  price_list_id: string
  price: number
  product: Product
}

interface OrderItem {
  product: Product
  quantity: number
  customPrice: number
}

export default function CrearPedidoPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [priceLists, setPriceLists] = useState<PriceList[]>([])
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null)
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [showChangeClientDialog, setShowChangeClientDialog] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
  })

  useEffect(() => {
    loadCustomers()
    loadPriceLists()
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

  async function loadPriceLists() {
    const { data, error } = await supabase
      .from('price_lists')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error loading price lists:', error)
      toast.error('Error al cargar listas de precios')
      return
    }

    setPriceLists(data || [])
  }

  async function loadProductsFromPriceList(priceListId: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('product_prices')
        .select(`
          id,
          product_id,
          price_list_id,
          price,
          products (*)
        `)
        .eq('price_list_id', priceListId)

      if (error) throw error

      // Transform the data to match our interface
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        price_list_id: item.price_list_id,
        price: item.price,
        product: item.products
      }))

      setProductPrices(transformedData)

      // Update prices of existing products in the order
      setOrderItems(prevItems =>
        prevItems.map(item => {
          const newPrice = transformedData.find(pp => pp.product_id === item.product.id)
          return newPrice ? { ...item, customPrice: newPrice.price } : item
        })
      )
    } catch (error: any) {
      console.error('Error loading products from price list:', error)
      toast.error('Error al cargar productos de la lista')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCustomer() {
    if (!newCustomerData.name || !newCustomerData.phone) {
      toast.error('Nombre y teléfono son obligatorios')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: newCustomerData.name,
          phone: newCustomerData.phone,
          email: newCustomerData.email || null,
          address: newCustomerData.address || null,
          city: newCustomerData.city || null,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Cliente creado exitosamente')
      setShowNewCustomerDialog(false)
      setNewCustomerData({ name: '', phone: '', email: '', address: '', city: '' })
      await loadCustomers()
      setSelectedCustomer(data)
    } catch (error: any) {
      console.error('Error creating customer:', error)
      toast.error('Error al crear cliente')
    } finally {
      setLoading(false)
    }
  }

  function addProductToOrder(productPrice: ProductPrice) {
    const existing = orderItems.find(item => item.product.id === productPrice.product.id)
    if (existing) {
      toast.error('Este producto ya está en el pedido')
      return
    }

    setOrderItems([...orderItems, {
      product: productPrice.product,
      quantity: 1,
      customPrice: productPrice.price
    }])
    toast.success('Producto agregado')
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
    return orderItems.reduce((sum, item) => sum + (item.customPrice * item.quantity), 0)
  }

  async function handleCreateOrder() {
    if (!selectedCustomer) {
      toast.error('Debes seleccionar un cliente')
      return
    }

    if (!selectedPriceList) {
      toast.error('Debes seleccionar una lista de precios')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Debes agregar al menos un producto')
      return
    }

    const itemsWithoutPrice = orderItems.filter(item => item.customPrice <= 0)
    if (itemsWithoutPrice.length > 0) {
      toast.error('Todos los productos deben tener un precio mayor a 0')
      return
    }

    setLoading(true)

    try {
      const total = calculateTotal()

      // Generate order number
      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('generate_order_number')

      if (orderNumberError) throw orderNumberError

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: selectedCustomer.name,
          customer_email: selectedCustomer.email || null,
          customer_phone: selectedCustomer.phone,
          customer_id: selectedCustomer.id,
          price_list_id: selectedPriceList.id,
          status: 'pendiente',
          notes: notes || null,
          delivery_date: deliveryDate || null,
          total,
        })
        .select()
        .single()

      if (orderError) throw orderError

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crear Nuevo Pedido</h1>
        <p className="text-muted-foreground">Completá los 3 pasos para generar el pedido</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedCustomer ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${selectedCustomer ? 'bg-white text-primary' : 'bg-background text-muted-foreground'}`}>
            {selectedCustomer ? <Check className="h-5 w-5" /> : '1'}
          </div>
          <span className="font-medium">Cliente</span>
        </div>
        <div className={`h-1 w-16 rounded ${selectedCustomer ? 'bg-primary' : 'bg-border'}`}></div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedPriceList ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${selectedPriceList ? 'bg-white text-primary' : 'bg-background text-muted-foreground'}`}>
            {selectedPriceList ? <Check className="h-5 w-5" /> : '2'}
          </div>
          <span className="font-medium">Lista</span>
        </div>
        <div className={`h-1 w-16 rounded ${selectedPriceList ? 'bg-primary' : 'bg-border'}`}></div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${orderItems.length > 0 ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${orderItems.length > 0 ? 'bg-white text-primary' : 'bg-background text-muted-foreground'}`}>
            {orderItems.length > 0 ? <Check className="h-5 w-5" /> : '3'}
          </div>
          <span className="font-medium">Productos ({orderItems.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1: Select Customer */}
          {!selectedCustomer ? (
            <Card className="border-2 border-primary shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">1</div>
                  Seleccionar Cliente
                </CardTitle>
                <CardDescription className="text-base">Buscá el cliente o agregá uno nuevo</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o teléfono..."
                      value={searchCustomer}
                      onChange={(e) => setSearchCustomer(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                  <Button onClick={() => setShowNewCustomerDialog(true)} size="lg" className="h-12 px-6">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Nuevo Cliente
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No se encontraron clientes</p>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <Card
                        key={customer.id}
                        className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setSearchCustomer('')
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl font-bold text-primary">{customer.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-lg truncate">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.phone}</p>
                              {customer.city && <p className="text-xs text-muted-foreground">{customer.city}</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{selectedCustomer.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{selectedCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => {
                    if (orderItems.length > 0) {
                      setShowChangeClientDialog(true)
                    } else {
                      setSelectedCustomer(null)
                      setSelectedPriceList(null)
                      setProductPrices([])
                      setOrderItems([])
                    }
                  }}>
                    Cambiar Cliente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: Select Price List */}
          {selectedCustomer && !selectedPriceList && (
            <Card className="border-2 border-primary shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">2</div>
                  Seleccionar Lista de Precios
                </CardTitle>
                <CardDescription className="text-base">Elegí la lista que querés usar para este pedido</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {priceLists.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No hay listas de precios disponibles</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {priceLists.map((priceList) => (
                      <Card
                        key={priceList.id}
                        className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                        onClick={() => {
                          setSelectedPriceList(priceList)
                          loadProductsFromPriceList(priceList.id)
                        }}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <DollarSign className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-lg">{priceList.name}</p>
                              {priceList.description && (
                                <p className="text-sm text-muted-foreground truncate">{priceList.description}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedPriceList && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{selectedPriceList.name}</p>
                      <p className="text-sm text-muted-foreground">{productPrices.length} productos disponibles</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSelectedPriceList(null)
                    setProductPrices([])
                    // NO borramos orderItems - los productos se mantienen
                  }}>
                    Cambiar Lista
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: Add Products */}
          {selectedPriceList && (
            <Card className={orderItems.length === 0 ? 'border-2 border-primary shadow-lg' : ''}>
              <CardHeader className={orderItems.length === 0 ? 'bg-primary/5' : ''}>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">3</div>
                  Agregar Productos al Pedido
                </CardTitle>
                <CardDescription className="text-base">Hacé clic en los productos para agregarlos</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Cargando productos...</p>
                ) : productPrices.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Esta lista no tiene productos</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productPrices.map((pp) => {
                      const isAdded = orderItems.some(item => item.product.id === pp.product.id)
                      return (
                        <Card
                          key={pp.id}
                          className={`cursor-pointer transition-all ${
                            isAdded
                              ? 'border-2 border-primary bg-primary/5 shadow-md'
                              : 'hover:border-primary hover:shadow-md'
                          }`}
                          onClick={() => !isAdded && addProductToOrder(pp)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {pp.product.image_url && (
                                <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                  <img
                                    src={pp.product.image_url}
                                    alt={pp.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">{pp.product.name}</p>
                                {pp.product.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">{pp.product.description}</p>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-bold text-primary">${pp.price.toFixed(2)}</p>
                                {isAdded && (
                                  <div className="flex items-center gap-1 text-xs text-primary font-medium mt-1">
                                    <Check className="h-3 w-3" />
                                    Agregado
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Productos en el Pedido</CardTitle>
                <CardDescription>Ajustá las cantidades según necesites</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {orderItems.map((item) => (
                  <Card key={item.product.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {item.product.image_url && (
                          <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold">{item.product.name}</p>
                          {item.product.description && (
                            <p className="text-xs text-muted-foreground mt-1">{item.product.description}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeProduct(item.product.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div>
                          <Label className="text-xs">Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Precio</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.customPrice}
                            onChange={(e) => updatePrice(item.product.id, parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Subtotal</Label>
                          <div className="mt-1 h-10 flex items-center font-bold text-primary text-lg">
                            ${(item.customPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          {orderItems.length > 0 && (
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
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{selectedCustomer?.name || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lista:</span>
                  <span className="font-medium">{selectedPriceList?.name || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Productos:</span>
                  <span className="font-medium">{orderItems.length}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">TOTAL:</span>
                  <span className="text-3xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCreateOrder}
                disabled={loading || !selectedCustomer || !selectedPriceList || orderItems.length === 0}
                className="w-full h-12 text-base"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {loading ? 'Creando...' : 'Crear Pedido'}
              </Button>

              <Button variant="outline" onClick={() => router.push('/admin')} className="w-full">
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Client Confirmation Dialog */}
      <Dialog open={showChangeClientDialog} onOpenChange={setShowChangeClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cambiar de Cliente?</DialogTitle>
            <DialogDescription>
              Si cambias de cliente se perderán todos los productos agregados al pedido ({orderItems.length} productos).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeClientDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setSelectedCustomer(null)
                setSelectedPriceList(null)
                setProductPrices([])
                setOrderItems([])
                setShowChangeClientDialog(false)
              }}
            >
              Sí, Cambiar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            <DialogDescription>Los campos con * son obligatorios</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-name">Nombre *</Label>
              <Input
                id="new-name"
                value={newCustomerData.name}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <Label htmlFor="new-phone">Teléfono *</Label>
              <Input
                id="new-phone"
                value={newCustomerData.phone}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newCustomerData.email}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                placeholder="cliente@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="new-city">Ciudad</Label>
              <Input
                id="new-city"
                value={newCustomerData.city}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, city: e.target.value })}
                placeholder="Ciudad"
              />
            </div>
            <div>
              <Label htmlFor="new-address">Dirección</Label>
              <Textarea
                id="new-address"
                value={newCustomerData.address}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                placeholder="Dirección completa"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewCustomerDialog(false)
                setNewCustomerData({ name: '', phone: '', email: '', address: '', city: '' })
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateCustomer} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
