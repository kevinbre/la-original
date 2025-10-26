'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types'
import { useCartStore } from '@/lib/store'
import { toast } from 'sonner'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Package, Minus, Plus } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${quantity} ${product.name} agregado al carrito`, {
      description: 'Podés seguir comprando o ir al carrito',
    })
    setQuantity(1)
  }

  const increment = () => setQuantity(q => q + 1)
  const decrement = () => setQuantity(q => Math.max(1, q - 1))

  return (
    <Card className="group flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <h3 className="mb-1 line-clamp-2 font-medium leading-tight">
          {product.name}
        </h3>

        {product.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
            {product.description}
          </p>
        )}

        {product.category && (
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 p-4 pt-0">
        {/* Quantity Selector */}
        <div className="flex w-full items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={decrement}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="min-w-[3ch] text-center text-sm font-medium">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={increment}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-3 w-3" />
          Agregar
        </Button>
      </CardFooter>
    </Card>
  )
}
