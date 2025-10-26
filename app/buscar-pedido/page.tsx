'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search, Package, AlertCircle } from 'lucide-react'

export default function BuscarPedidoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchData, setSearchData] = useState({
    orderNumber: '',
    token: '',
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', searchData.orderNumber.toUpperCase())
        .eq('guest_token', searchData.token.toUpperCase())
        .single()

      if (error || !order) {
        toast.error('Pedido no encontrado', {
          description: 'Verifica el número de pedido y el código de acceso'
        })
        return
      }

      toast.success('Pedido encontrado', {
        description: 'Redirigiendo...'
      })

      router.push(`/pedido/${order.order_number}?token=${order.guest_token}`)
    } catch (error) {
      toast.error('Error al buscar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl">Buscar Pedido</CardTitle>
              <CardDescription className="text-base">
                Ingresá el número de pedido y el código que recibiste por email
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Número de Pedido</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="orderNumber"
                    type="text"
                    placeholder="PED-202410-0001"
                    value={searchData.orderNumber}
                    onChange={(e) =>
                      setSearchData({ ...searchData, orderNumber: e.target.value })
                    }
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Lo recibiste al crear el pedido
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Código de Acceso</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="ABC12345"
                  value={searchData.token}
                  onChange={(e) =>
                    setSearchData({ ...searchData, token: e.target.value })
                  }
                  className="font-mono tracking-wider uppercase"
                  maxLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Código único de 8 caracteres
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Search className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Pedido
                  </>
                )}
              </Button>
            </form>

            <div className="rounded-lg border border-muted bg-muted/50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Recordatorio</p>
                  <p className="text-xs text-muted-foreground">
                    Guardá el número de pedido y código en un lugar seguro para poder consultar tu pedido en cualquier momento.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
