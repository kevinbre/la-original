'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Product, Profile } from '@/types'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Package,
  Plus,
  Pencil,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  Power,
  PowerOff,
  Search,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export default function AdminProductosPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [sortField, setSortField] = useState<keyof Product>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image_url: '',
    unit: 'unidad',
    units_per_pack: '',
    origin: '',
  })

  useEffect(() => {
    checkAdmin()
    loadProducts()
  }, [])

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

  const loadProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading products:', error)
      toast.error('Error al cargar productos')
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const dataToSave = {
      ...formData,
      units_per_pack: formData.units_per_pack ? parseInt(formData.units_per_pack) : null,
    }

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(dataToSave)
        .eq('id', editingProduct.id)

      if (error) {
        toast.error('Error al actualizar producto')
      } else {
        toast.success('Producto actualizado')
        closeModal()
        loadProducts()
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([{ ...dataToSave, is_active: true }])

      if (error) {
        toast.error('Error al crear producto')
      } else {
        toast.success('Producto creado')
        closeModal()
        loadProducts()
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      image_url: product.image_url || '',
      unit: product.unit || 'unidad',
      units_per_pack: product.units_per_pack?.toString() || '',
      origin: product.origin || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Error al eliminar producto')
    } else {
      toast.success('Producto eliminado')
      loadProducts()
    }
  }

  const confirmDelete = (product: Product) => {
    toast.custom((t) => (
      <div className="bg-card border rounded-lg p-4 shadow-lg">
        <p className="font-medium mb-2">¿Eliminar {product.name}?</p>
        <p className="text-sm text-muted-foreground mb-4">Esta acción eliminará el producto completamente</p>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => {
            handleDelete(product.id)
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

  const toggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (error) {
      toast.error('Error al actualizar estado')
    } else {
      toast.success(product.is_active ? 'Producto desactivado' : 'Producto activado')
      loadProducts()
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      category: '',
      image_url: '',
      unit: 'unidad',
      units_per_pack: '',
      origin: '',
    })
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

  // Filtrado, ordenamiento y paginación
  const filteredAndSortedProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.origin?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
            <h1 className="text-3xl font-bold mb-2">Gestión de Productos</h1>
            <p className="text-muted-foreground">
              Creá y administrá tu catálogo de productos
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Productos</CardTitle>
              <CardDescription>
                {filteredAndSortedProducts.length} de {products.length} producto{products.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No hay productos creados</p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear primer producto
              </Button>
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
                      <Button variant="ghost" size="sm" onClick={() => handleSort('category')} className="h-8 px-2">
                        Categoría {getSortIcon('category')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('origin')} className="h-8 px-2">
                        Proveedor {getSortIcon('origin')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('unit')} className="h-8 px-2">
                        Unidad {getSortIcon('unit')}
                      </Button>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded border bg-muted">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="secondary">{product.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.origin ? (
                          <Badge variant="outline" className="capitalize">{product.origin}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {product.unit}
                        {product.units_per_pack && (
                          <span className="text-muted-foreground"> x{product.units_per_pack}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(product)}
                          className="h-8"
                        >
                          {product.is_active ? (
                            <>
                              <Power className="mr-2 h-3 w-3 text-green-600" />
                              <span className="text-green-600">Activo</span>
                            </>
                          ) : (
                            <>
                              <PowerOff className="mr-2 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Inactivo</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(product)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Modificá los datos del producto'
                : 'Completá los datos para crear un nuevo producto'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Coca Cola 2.25L"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto (opcional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Gaseosas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Proveedor/Origen</Label>
                <Input
                  id="origin"
                  value={formData.origin || ''}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="Ej: Carrefour, Distribuidora X, etc."
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Indica de dónde comprás este producto
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unidad de Venta</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidad">Unidad</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="caja">Caja</SelectItem>
                    <SelectItem value="litro">Litro</SelectItem>
                    <SelectItem value="kg">Kilogramo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="units_per_pack">Cantidad por {formData.unit}</Label>
                <Input
                  id="units_per_pack"
                  type="number"
                  min="1"
                  value={formData.units_per_pack}
                  onChange={(e) => setFormData({ ...formData, units_per_pack: e.target.value })}
                  placeholder="Ej: 6, 12, 24"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Ej: Caja x6, Pack x12
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de Imagen</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://carrefourar.vtexassets.com/... o cualquier URL"
              />
              <p className="text-xs text-muted-foreground">
                Podés usar URLs de Carrefour, Día, Coto o cualquier otra fuente
              </p>
              <p className="text-xs text-blue-600">
                Ejemplo Carrefour: https://carrefourar.vtexassets.com/arquivos/ids/693199-1600-auto
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
