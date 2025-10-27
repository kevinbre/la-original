import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { FloatingWhatsAppButton } from '@/components/FloatingWhatsAppButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'La Original - Distribuidora de Bebidas',
  description: 'Tu distribuidora de confianza',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'La Original',
  },
  openGraph: {
    title: 'La Original - Distribuidora de Bebidas',
    description: 'Tu distribuidora de confianza',
    images: ['/logo.png'],
  },
  other: {
    'theme-color': '#000000',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster richColors position="top-right" toastOptions={{
            classNames: {
              toast: 'mt-20',
            },
          }} />
          <FloatingWhatsAppButton />

          <footer className="relative bg-gradient-to-br from-[#9d4c1f] via-[#c96434] to-[#9d4c1f] dark:from-[#7a3a18] dark:via-[#9d4c1f] dark:to-[#7a3a18] text-white mt-12">
            {/* Decorative wave at top */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
              <svg className="relative block w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-background"></path>
              </svg>
            </div>

            <div className="relative pt-16 pb-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {/* Logo and description */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <img
                      src="/logo.png"
                      alt="La Original"
                      className="h-16 w-16 mb-4 drop-shadow-lg"
                    />
                    <h3 className="text-2xl font-bold mb-2 text-white">LA ORIGINAL</h3>
                    <p className="text-orange-100 text-sm leading-relaxed">
                      Tu distribuidora de bebidas de confianza. Calidad y servicio desde siempre.
                    </p>
                  </div>

                  {/* Quick links */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h4 className="text-lg font-semibold mb-4 text-white">Enlaces Rápidos</h4>
                    <nav className="flex flex-col space-y-2">
                      <a href="/productos" className="text-orange-100 hover:text-white transition-colors duration-200 text-sm">
                        Productos
                      </a>
                      <a href="/mis-pedidos" className="text-orange-100 hover:text-white transition-colors duration-200 text-sm">
                        Mis Pedidos
                      </a>
                      <a href="/buscar-pedido" className="text-orange-100 hover:text-white transition-colors duration-200 text-sm">
                        Buscar Pedido
                      </a>
                    </nav>
                  </div>

                  {/* Contact info */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h4 className="text-lg font-semibold mb-4 text-white">Contacto</h4>
                    <div className="flex flex-col space-y-2 text-sm">
                      <p className="text-orange-100">
                        <span className="font-medium text-white">Email:</span> contacto@laoriginal.com
                      </p>
                      <p className="text-orange-100">
                        <span className="font-medium text-white">Teléfono:</span> (123) 456-7890
                      </p>
                      <p className="text-orange-100">
                        <span className="font-medium text-white">Horario:</span> Lun - Vie: 8:00 - 18:00
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-6 border-t border-orange-700/50">
                  <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-orange-100 text-sm">
                      © {new Date().getFullYear()} La Original. Todos los derechos reservados.
                    </p>
                    <div className="flex space-x-6">
                      <a href="#" className="text-orange-100 hover:text-white transition-colors duration-200 text-sm">
                        Términos y Condiciones
                      </a>
                      <a href="#" className="text-orange-100 hover:text-white transition-colors duration-200 text-sm">
                        Política de Privacidad
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
