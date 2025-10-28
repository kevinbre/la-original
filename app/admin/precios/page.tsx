'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PriceList, Product, Profile } from '@/types'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
  X,
  FileText,
  AlertCircle,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search
} from 'lucide-react'

interface ProductPrice {
  id: string
  product_id: string
  price: number
  is_active?: boolean
  product?: Product
}

export default function AdminPreciosPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [priceLists, setPriceLists] = useState<PriceList[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedList, setSelectedList] = useState<PriceList | null>(null)
  const [prices, setPrices] = useState<ProductPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [listForm, setListForm] = useState({ name: '', description: '', color: '#b85c2f' })
  const [pendingChanges, setPendingChanges] = useState<{ [productId: string]: string }>({})
  const [pendingActiveChanges, setPendingActiveChanges] = useState<{ [productId: string]: boolean }>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Product>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    checkAdmin()
    loadData()
  }, [])

  useEffect(() => {
    if (selectedList) {
      loadPrices(selectedList.id)
    }
  }, [selectedList])

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

  const loadData = async () => {
    setLoading(true)

    const { data: listsData } = await supabase
      .from('price_lists')
      .select('*')
      .order('created_at', { ascending: false })

    if (listsData) {
      setPriceLists(listsData)
      if (listsData.length > 0 && !selectedList) {
        setSelectedList(listsData[0])
      }
    }

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (productsData) {
      setProducts(productsData)
    }

    setLoading(false)
  }

  const loadPrices = async (listId: string) => {
    const { data } = await supabase
      .from('product_prices')
      .select('*, products(*)')
      .eq('price_list_id', listId)

    if (data) {
      setPrices(data as any)
    }
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase
      .from('price_lists')
      .insert([{ ...listForm, is_active: true }])

    if (error) {
      toast.error('Error al crear lista de precios')
    } else {
      toast.success('Lista creada')
      setShowModal(false)
      setListForm({ name: '', description: '', color: '#b85c2f' })
      loadData()
    }
  }

  const handleDeleteList = async (id: string) => {
    const { error } = await supabase
      .from('price_lists')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Error al eliminar lista de precios')
    } else {
      toast.success('Lista eliminada')
      if (selectedList?.id === id) {
        setSelectedList(null)
      }
      loadData()
    }
  }

  const confirmDeleteList = (list: PriceList) => {
    toast.custom((t) => (
      <div className="bg-card border rounded-lg p-4 shadow-lg">
        <p className="font-medium mb-2">¿Eliminar {list.name}?</p>
        <p className="text-sm text-muted-foreground mb-4">Esta acción no se puede deshacer</p>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => {
            handleDeleteList(list.id)
            toast.dismiss(t)
          }}>
            Eliminar
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t)}>
            Cancelar
          </Button>
        </div>
      </div>
    ), { duration: 5000 })
  }

  const handlePriceChange = (productId: string, newPrice: string) => {
    setPendingChanges({ ...pendingChanges, [productId]: newPrice })
    setHasChanges(true)
  }

  const handleProductActiveToggle = (productId: string, isActive: boolean) => {
    setPendingActiveChanges({ ...pendingActiveChanges, [productId]: isActive })
    setHasChanges(true)
  }

  const getProductActive = (productId: string) => {
    if (pendingActiveChanges[productId] !== undefined) {
      return pendingActiveChanges[productId]
    }
    const price = prices.find((p) => p.product_id === productId)
    return price?.is_active ?? true
  }

  const saveAllChanges = async () => {
    if (!selectedList || (Object.keys(pendingChanges).length === 0 && Object.keys(pendingActiveChanges).length === 0)) return

    setSaving(true)

    try {
      const updates = []
      const inserts = []

      // Procesar cambios de precio
      for (const [productId, priceStr] of Object.entries(pendingChanges)) {
        const price = parseFloat(priceStr)
        if (isNaN(price) || price < 0) continue

        const existing = prices.find((p) => p.product_id === productId)

        if (existing) {
          const updateData: any = { price }
          // Si también hay cambio de is_active para este producto, incluirlo
          if (pendingActiveChanges[productId] !== undefined) {
            updateData.is_active = pendingActiveChanges[productId]
          }

          updates.push(
            supabase
              .from('product_prices')
              .update(updateData)
              .eq('id', existing.id)
          )
        } else {
          inserts.push({
            product_id: productId,
            price_list_id: selectedList.id,
            price,
            is_active: pendingActiveChanges[productId] ?? true,
          })
        }
      }

      // Procesar cambios de is_active que no tengan cambio de precio
      for (const [productId, isActive] of Object.entries(pendingActiveChanges)) {
        if (pendingChanges[productId] !== undefined) continue // Ya procesado arriba

        const existing = prices.find((p) => p.product_id === productId)
        if (existing) {
          updates.push(
            supabase
              .from('product_prices')
              .update({ is_active: isActive })
              .eq('id', existing.id)
          )
        }
      }

      const results = await Promise.all(updates)
      const updateErrors = results.filter(r => r.error)
      if (updateErrors.length > 0) {
        throw new Error('Error al actualizar algunos precios')
      }

      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('product_prices')
          .insert(inserts)

        if (insertError) throw insertError
      }

      toast.success('Cambios guardados correctamente')
      setPendingChanges({})
      setPendingActiveChanges({})
      setHasChanges(false)
      loadPrices(selectedList.id)
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Error al guardar cambios')
    } finally {
      setSaving(false)
    }
  }

  const cancelChanges = () => {
    setPendingChanges({})
    setHasChanges(false)
  }

  const getProductPrice = (productId: string) => {
    if (pendingChanges[productId] !== undefined) {
      return pendingChanges[productId]
    }
    const price = prices.find((p) => p.product_id === productId)
    return price?.price?.toString() || ''
  }

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: keyof Product) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const filteredAndSortedProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (aValue == null) return 1
      if (bValue == null) return -1
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Listas de Precios</h1>
            <p className="text-muted-foreground">
              Gestioná los precios de tus productos por lista
            </p>
          </div>
          <div className="flex gap-3">
            {hasChanges && (
              <>
                <Button variant="outline" onClick={cancelChanges} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={saveAllChanges} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Lista
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Listas Disponibles</CardTitle>
              <CardDescription>
                {priceLists.length} lista{priceLists.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {priceLists.map((list) => (
                <div
                  key={list.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-all border ${
                    selectedList?.id === list.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedList(list)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="h-4 w-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: list.color || '#b85c2f' }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{list.name}</div>
                        {list.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {list.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      confirmDeleteList(list)
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1 text-destructive" />
                    <span className="text-xs text-destructive">Eliminar</span>
                  </Button>
                </div>
              ))}

              {priceLists.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay listas creadas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Price Table */}
        <div className="lg:col-span-3">
          {selectedList ? (
            <Card>
              <CardHeader>
                <CardTitle>Precios: {selectedList.name}</CardTitle>
                <CardDescription>
                  {selectedList.description || 'Configurá los precios para cada producto'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No hay productos activos</p>
                    <Link href="/admin/productos">
                      <Button variant="outline" size="sm">
                        Ir a Productos
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="h-8 px-2">
                              Producto {getSortIcon('name')}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" size="sm" onClick={() => handleSort('description')} className="h-8 px-2">
                              Descripción {getSortIcon('description')}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" size="sm" onClick={() => handleSort('category')} className="h-8 px-2">
                              Categoría {getSortIcon('category')}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button variant="ghost" size="sm" onClick={() => handleSort('unit')} className="h-8 px-2">
                              Unidad {getSortIcon('unit')}
                            </Button>
                          </TableHead>
                          <TableHead className="text-right">Precio ($)</TableHead>
                          <TableHead className="text-center">Activo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs">
                              {product.description ? (
                                <span className="line-clamp-2">{product.description}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {product.category ? (
                                <Badge variant="secondary" className="text-xs">
                                  {product.category}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {product.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={getProductPrice(product.id)}
                                onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                className="max-w-[180px] ml-auto text-right"
                                placeholder="0.00"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <Switch
                                  checked={getProductActive(product.id)}
                                  onCheckedChange={(checked) => handleProductActiveToggle(product.id, checked)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Seleccioná una lista de precios</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Elegí una lista de la izquierda o creá una nueva
                </p>
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Lista
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Lista de Precios</DialogTitle>
            <DialogDescription>
              Creá una nueva lista para organizar tus precios
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateList} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={listForm.name}
                onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                required
                placeholder="Ej: Lista Mayorista"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={listForm.description}
                onChange={(e) => setListForm({ ...listForm, description: e.target.value })}
                placeholder="Descripción opcional..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color de la Lista</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="color"
                  type="color"
                  value={listForm.color}
                  onChange={(e) => setListForm({ ...listForm, color: e.target.value })}
                  className="w-20 h-10 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Color para identificar visualmente la lista
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false)
                  setListForm({ name: '', description: '', color: '#b85c2f' })
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Crear Lista
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
