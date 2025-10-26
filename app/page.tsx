import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  Package,
  CheckCircle2,
  Truck,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 text-sm">
              <Star className="mr-1 h-3 w-3 fill-current" />
              La distribuidora #1 de la zona
            </Badge>

            <h1 className="mb-6 text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">
              LA ORIGINAL
            </h1>

            <p className="mb-4 text-xl font-medium text-muted-foreground sm:text-2xl">
              Distribuidora de bebidas
            </p>

            <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Pedidos rápidos, presupuestos personalizados y seguimiento en tiempo real.
              Simplificamos tu compra de bebidas.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/productos">
                <Button size="lg" className="w-full text-base sm:w-auto">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Hacer un Pedido
                </Button>
              </Link>
              <Link href="/buscar-pedido">
                <Button variant="outline" size="lg" className="w-full text-base sm:w-auto">
                  <Package className="mr-2 h-5 w-5" />
                  Rastrear Pedido
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 border-t pt-12">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">Clientes activos</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24h</div>
                <div className="text-sm text-muted-foreground">Entrega rápida</div>
              </div>
              <div>
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">Calidad garantizada</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              Beneficios
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
              ¿Por qué LA ORIGINAL?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Te ofrecemos la mejor experiencia en cada pedido
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="group border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-950">
                  <Zap className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Pedidos Ágiles</CardTitle>
                <CardDescription className="text-base">
                  Sistema optimizado para que hagas tu pedido en segundos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950">
                  <Clock className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Seguimiento 24/7</CardTitle>
                <CardDescription className="text-base">
                  Monitoreá tu pedido en tiempo real desde cualquier dispositivo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950">
                  <TrendingUp className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">Precios Mayoristas</CardTitle>
                <CardDescription className="text-base">
                  Presupuestos personalizados según tu volumen de compra
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 transition-all hover:border-primary hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950">
                  <Truck className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl">Entrega Express</CardTitle>
                <CardDescription className="text-base">
                  Recibí tus productos en tu negocio de forma rápida y segura
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-b py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              Proceso
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Cómo funciona
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Hacé tu pedido en 3 simples pasos
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-3 text-xl font-bold">Elegí tus productos</h3>
                <p className="text-muted-foreground">
                  Navegá nuestro catálogo y agregá lo que necesitás al carrito
                </p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="mb-3 text-xl font-bold">Recibí tu presupuesto</h3>
                <p className="text-muted-foreground">
                  Te enviamos un presupuesto personalizado para confirmar
                </p>
              </div>

              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-3 text-xl font-bold">Recibilo en tu negocio</h3>
                <p className="text-muted-foreground">
                  Coordinamos la entrega y llevamos todo a tu puerta
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-2">
            <CardContent className="flex flex-col items-center gap-6 p-12 text-center lg:flex-row lg:gap-12 lg:text-left">
              <div className="flex-1">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  ¿Listo para empezar?
                </h2>
                <p className="text-lg text-muted-foreground lg:text-xl">
                  Hacé tu primer pedido hoy y descubrí por qué somos la distribuidora preferida
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link href="/productos">
                  <Button size="lg" className="group w-full text-base sm:w-auto lg:w-full">
                    Ver Catálogo
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button variant="outline" size="lg" className="w-full text-base sm:w-auto lg:w-full">
                    Crear Cuenta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Compra Segura</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Productos Verificados</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-5 w-5" />
              <span className="text-sm font-medium">Envío Rápido</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-sm font-medium">Calidad Garantizada</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
