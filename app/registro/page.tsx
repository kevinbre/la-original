'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UserPlus, Mail, Lock, User, Phone, Chrome } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        description: 'Verifica que ambas contraseñas sean iguales'
      })
      return
    }

    if (formData.password.length < 6) {
      toast.error('Contraseña muy corta', {
        description: 'La contraseña debe tener al menos 6 caracteres'
      })
      return
    }

    setLoading(true)

    try {
      // Sign up user with metadata (el trigger creará el perfil automáticamente)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        toast.success('¡Cuenta creada exitosamente!', {
          description: 'Ya podés empezar a hacer pedidos'
        })
        router.push('/productos')
        router.refresh()
      }
    } catch (error: any) {
      toast.error('Error al crear la cuenta', {
        description: error.message || 'Intenta nuevamente'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast.error('Error al registrarse con Google', {
        description: error.message
      })
      setGoogleLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
            <CardDescription className="text-center">
              Registrate para hacer pedidos y seguir su estado
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {googleLoading ? 'Conectando...' : 'Registrarse con Google'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O registrarse con email
                </span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="pl-9"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="pl-9"
                    required
                    disabled={loading || googleLoading}
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
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-9"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-9"
                    required
                    minLength={6}
                    disabled={loading || googleLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="pl-9"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || googleLoading}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <Separator />

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
