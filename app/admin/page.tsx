'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Order, ORDER_STATUS_LABELS, Profile } from '@/types'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Settings,
  DollarSign,
  LayoutDashboard,
  Users,
  ShoppingCart
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    checkAdmin()
    loadOrders()
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

  const loadOrders = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          unit_price,
          custom_price,
          subtotal
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading orders:', error)
      toast.error('Error al cargar pedidos')
    } else {
      setOrders(data || [])
    }

    setLoading(false)
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((order) => order.status === statusFilter)

  const stats = [
    {
      title: 'Pendientes',
      value: orders.filter((o) => o.status === 'pendiente').length,
      icon: Clock,
      description: 'Requieren revisión'
    },
    {
      title: 'En Revisión',
      value: orders.filter((o) => o.status === 'en_revision').length,
      icon: AlertCircle,
      description: 'En proceso'
    },
    {
      title: 'Confirmados',
      value: orders.filter((o) => o.status === 'confirmado' || o.status === 'en_preparacion' || o.status === 'listo_entrega').length,
      icon: CheckCircle2,
      description: 'Activos'
    },
    {
      title: 'Total',
      value: orders.length,
      icon: Package,
      description: 'Todos los pedidos'
    },
  ]

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
        </div>
        <p className="text-muted-foreground">
          Gestioná pedidos, productos y listas de precios
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Link href="/admin/crear-pedido" className="w-full">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Crear Pedido
          </Button>
        </Link>
        <Link href="/admin/clientes" className="w-full">
          <Button className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Gestionar Clientes
          </Button>
        </Link>
        <Link href="/admin/productos" className="w-full">
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Gestionar Productos
          </Button>
        </Link>
        <Link href="/admin/precios" className="w-full">
          <Button variant="outline" className="w-full">
            <DollarSign className="mr-2 h-4 w-4" />
            Listas de Precios
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>
                Listado completo de todos los pedidos
              </CardDescription>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay pedidos para mostrar</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.customer_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {order.customer_phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'completado' ? 'default' :
                          order.status === 'cancelado' || order.status === 'rechazado' ? 'destructive' :
                          'secondary'
                        }>
                          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {order.order_items?.length || 0}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/pedidos/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver detalles
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
