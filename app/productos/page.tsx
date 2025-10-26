'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Search, X, Package2, SlidersHorizontal } from 'lucide-react'

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name')

    const { data, error } = await query

    if (error) {
      console.error('Error loading products:', error)
    } else {
      setProducts(data || [])

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data?.map((p) => p.category).filter(Boolean) as string[])
      )
      setCategories(uniqueCategories)
    }

    setLoading(false)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 ||
      (product.category && selectedCategories.includes(product.category))
    return matchesSearch && matchesCategory
  })

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
  }

  const hasActiveFilters = searchTerm !== '' || selectedCategories.length > 0

  const FiltersSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label htmlFor="search" className="mb-2 block text-sm font-medium">
          Buscar
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <Label className="mb-3 block text-sm font-medium">Categorías</Label>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        </>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6 lg:py-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold tracking-tight lg:text-3xl">
          Nuestros Productos
        </h1>
        <p className="text-sm text-muted-foreground lg:text-base">
          Explorá nuestro catálogo completo y agregá productos a tu pedido
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FiltersSidebar />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} producto{filteredProducts.length !== 1 && 's'}
            </p>
            <Button variant="outline" size="sm" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {(searchTerm ? 1 : 0) + selectedCategories.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Filters */}
          {mobileFiltersOpen && (
            <Card className="mb-4 lg:hidden">
              <CardContent className="pt-6">
                <FiltersSidebar />
              </CardContent>
            </Card>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtros:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Búsqueda: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <Skeleton className="aspect-square w-full" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="mb-3 h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                  <CardFooter className="flex-col gap-2 p-4 pt-0">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package2 className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No se encontraron productos</h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? 'Intentá modificar los filtros para ver más resultados'
                    : 'No hay productos disponibles en este momento'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 hidden items-center justify-between lg:flex">
                <p className="text-sm text-muted-foreground">
                  Mostrando <span className="font-medium">{filteredProducts.length}</span> producto
                  {filteredProducts.length !== 1 && 's'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
