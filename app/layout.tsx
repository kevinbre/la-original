import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'La Original - Distribuidora de Bebidas',
  description: 'Tu distribuidora de confianza',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
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
          <Toaster richColors position="top-right" />

          <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8 mt-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">LA ORIGINAL</h3>
                <p className="text-gray-400">Distribuidora de Bebidas</p>
                <p className="text-gray-400 text-sm mt-4">
                  © 2024 La Original. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
