'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Edit, Trash2, User, Phone, Mail, MapPin, Loader2 } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string
  address: string | null
  city: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export default function ClientesPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })

  useEffect(() => {
    checkAdmin()
    loadCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      toast.error('No tenés permisos de administrador')
      router.push('/')
    }
  }

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
      setFilteredCustomers(data || [])
    } catch (error: any) {
      console.error('Error loading customers:', error)
      toast.error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address || '',
        city: customer.city || '',
        notes: customer.notes || '',
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveCustomer = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('Nombre y teléfono son obligatorios')
      return
    }

    setSaving(true)
    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone,
            address: formData.address || null,
            city: formData.city || null,
            notes: formData.notes || null,
          })
          .eq('id', editingCustomer.id)

        if (error) throw error
        toast.success('Cliente actualizado correctamente')
      } else {
        const { error } = await supabase
          .from('customers')
          .insert({
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone,
            address: formData.address || null,
            city: formData.city || null,
            notes: formData.notes || null,
          })

        if (error) throw error
        toast.success('Cliente creado correctamente')
      }

      setIsDialogOpen(false)
      loadCustomers()
    } catch (error: any) {
      console.error('Error saving customer:', error)
      toast.error('Error al guardar cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: !customer.is_active })
        .eq('id', customer.id)

      if (error) throw error
      toast.success(customer.is_active ? 'Cliente desactivado' : 'Cliente activado')
      loadCustomers()
    } catch (error: any) {
      console.error('Error toggling customer:', error)
      toast.error('Error al cambiar estado')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tu cartera de clientes
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} encontrado{filteredCustomers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nombre</TableHead>
                  <TableHead className="min-w-[120px]">Teléfono</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[150px]">Email</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[150px]">Ciudad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {customer.email || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {customer.city || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                        {customer.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(customer)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Modifica los datos del cliente'
                : 'Completa los datos del nuevo cliente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Teléfono <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="cliente@email.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Rosario"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Av. Pellegrini 1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre el cliente..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCustomer} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
