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
import { LogIn, Mail, Lock, Chrome, Package } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      toast.success('¡Bienvenido!', {
        description: 'Has iniciado sesión correctamente'
      })
      router.push('/productos')
      router.refresh()
    } catch (error: any) {
      toast.error('Error al iniciar sesión', {
        description: error.message || 'Verifica tus credenciales'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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
      toast.error('Error al iniciar sesión con Google', {
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
                <LogIn className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresá a tu cuenta para hacer pedidos y seguir tus órdenes
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {googleLoading ? 'Conectando...' : 'Continuar con Google'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continuar con email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/recuperar-contraseña"
                    className="text-xs text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
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
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || googleLoading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <Separator />

            <div className="text-center text-sm space-y-2">
              <p className="text-muted-foreground">
                ¿No tenés cuenta?{' '}
                <Link
                  href="/registro"
                  className="font-medium text-primary hover:underline"
                >
                  Registrate
                </Link>
              </p>

              <div className="pt-2">
                <Link
                  href="/buscar-pedido"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <Package className="mr-1 h-3 w-3" />
                  ¿Pediste sin registrarte? Buscá tu pedido
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
