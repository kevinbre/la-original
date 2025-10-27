'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ArrowLeft, Shield, ShieldCheck, User, Search, Loader2, Mail, Phone, Calendar } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: 'admin' | 'empleado' | 'customer'
  created_at: string
  updated_at: string
}

export default function UsuariosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'empleado' | 'customer'>('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false)
  const [newRole, setNewRole] = useState<'admin' | 'empleado' | 'customer'>('customer')
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    checkAdminAndLoadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, roleFilter, users])

  const checkAdminAndLoadUsers = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setCurrentUserId(session.user.id)

      // Una sola llamada para traer TODOS los usuarios (incluyendo el actual)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Verificar permisos del usuario actual
      const currentUser = data?.find(u => u.id === session.user.id)
      if (!currentUser || currentUser.role !== 'admin') {
        toast.error('No tenés permisos de administrador')
        router.push('/')
        return
      }

      setUsers(data || [])
    } catch (error: any) {
      console.error('Error loading users:', error)
      toast.error('Error al cargar usuarios')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error: any) {
      console.error('Error loading users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      )
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleChangeRole = (user: Profile) => {
    if (user.id === currentUserId) {
      toast.error('No podés cambiar tu propio rol')
      return
    }

    setSelectedUser(user)
    // Default to customer when changing role
    setNewRole('customer')
    setShowChangeRoleDialog(true)
  }

  const confirmChangeRole = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      const roleNames = {
        admin: 'Administrador',
        empleado: 'Empleado',
        customer: 'Cliente'
      }

      // Actualizar el usuario en el estado local inmediatamente
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === selectedUser.id
            ? { ...user, role: newRole, updated_at: new Date().toISOString() }
            : user
        )
      )

      toast.success(`Rol actualizado exitosamente`, {
        description: `${selectedUser.email} ahora es ${roleNames[newRole]}`
      })

      setShowChangeRoleDialog(false)
      setSelectedUser(null)

      // Recargar para asegurar sincronización con BD
      await loadUsers()
    } catch (error: any) {
      console.error('Error changing role:', error)
      toast.error('Error al cambiar el rol del usuario')
    }
  }

  const getRoleBadge = (role: 'admin' | 'empleado' | 'customer') => {
    if (role === 'admin') {
      return (
        <Badge className="bg-purple-600 text-white dark:bg-purple-700">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Administrador
        </Badge>
      )
    }
    if (role === 'empleado') {
      return (
        <Badge className="bg-blue-600 text-white dark:bg-blue-700">
          <Shield className="mr-1 h-3 w-3" />
          Empleado
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <User className="mr-1 h-3 w-3" />
        Cliente
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    empleados: users.filter(u => u.role === 'empleado').length,
    customers: users.filter(u => u.role === 'customer').length,
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        </div>
        <p className="text-muted-foreground">
          Administrá los roles y permisos de los usuarios registrados
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              Con permisos de admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.empleados}</div>
            <p className="text-xs text-muted-foreground">
              Personal autorizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios normales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Usuario</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar por email, nombre o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-filter">Filtrar por Rol</Label>
              <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                <SelectTrigger id="role-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="empleado">Empleados</SelectItem>
                  <SelectItem value="customer">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm || roleFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </span>
              {(searchTerm || roleFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('all')
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Hacé click en "Cambiar Rol" para convertir usuarios en administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="hidden md:table-cell">Contacto</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="hidden lg:table-cell">Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.full_name || 'Sin nombre'}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.phone ? (
                          <span className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin teléfono</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.created_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeRole(user)}
                          disabled={user.id === currentUserId}
                          className="w-full sm:w-auto"
                        >
                          <Shield className="mr-2 h-3 w-3" />
                          Cambiar Rol
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={showChangeRoleDialog} onOpenChange={setShowChangeRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés cambiar el rol de este usuario?
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Usuario:</span>
                  <span className="text-sm">{selectedUser.email}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Rol Actual:</span>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-role">Seleccionar Nuevo Rol</Label>
                <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                  <SelectTrigger id="new-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        <span>Administrador</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="empleado">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Empleado</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="customer">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Cliente</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newRole === 'admin' && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-4">
                  <div className="flex gap-2">
                    <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                        Acceso Completo
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Este usuario tendrá acceso completo al panel de administración y podrá gestionar pedidos, productos, precios, configuración y otros usuarios.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {newRole === 'empleado' && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-4">
                  <div className="flex gap-2">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Acceso Limitado
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Este usuario podrá crear y gestionar pedidos, productos, precios y clientes, pero NO podrá acceder a configuración de empresa, WhatsApp ni gestionar usuarios.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangeRoleDialog(false)
                setSelectedUser(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmChangeRole}
              className={newRole === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Confirmar Cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
