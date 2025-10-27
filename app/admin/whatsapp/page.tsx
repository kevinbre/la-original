'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { MessageCircle, Save, ArrowLeft, MapPin, Phone, Mail, Building2, Globe, FileText } from 'lucide-react'

interface WhatsAppSettings {
  id: string
  whatsapp_number: string | null
  show_whatsapp_button: boolean
  company_name: string
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  phone: string | null
  email: string | null
  website: string | null
}

export default function WhatsAppConfigPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null)

  useEffect(() => {
    checkAdmin()
    loadSettings()
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
  }

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: insertError } = await supabase
            .from('company_settings')
            .insert({
              company_name: 'LA ORIGINAL',
              whatsapp_number: null,
              show_whatsapp_button: true
            })
            .select()
            .single()

          if (insertError) throw insertError
          setSettings(newSettings)
        } else {
          throw error
        }
      } else {
        setSettings(data)
      }
    } catch (error: any) {
      console.error('Error loading settings:', error)
      toast.error('Error al cargar la configuración')
    }
  }

  async function handleSave() {
    if (!settings) return

    // Validar que el número de WhatsApp esté completo si el botón está activado
    if (settings.show_whatsapp_button && !settings.whatsapp_number?.trim()) {
      toast.error('Debés ingresar un número de WhatsApp si querés mostrar el botón')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('company_settings')
        .update({
          whatsapp_number: settings.whatsapp_number,
          show_whatsapp_button: settings.show_whatsapp_button,
          company_name: settings.company_name,
          address: settings.address,
          city: settings.city,
          state: settings.state,
          zip_code: settings.zip_code,
          phone: settings.phone,
          email: settings.email,
          website: settings.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)

      if (error) throw error

      toast.success('Configuración de WhatsApp guardada exitosamente', {
        description: 'Los cambios ya están activos en tu sitio'
      })
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold">Configuración de WhatsApp</h1>
        </div>
        <p className="text-muted-foreground">
          Configurá el botón flotante de WhatsApp y los datos de contacto de tu negocio
        </p>
      </div>

      <div className="space-y-6">
        {/* WhatsApp Button Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Botón Flotante de WhatsApp
            </CardTitle>
            <CardDescription>
              El botón aparecerá en la esquina inferior derecha de todas las páginas públicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatsapp_number">Número de WhatsApp *</Label>
              <Input
                id="whatsapp_number"
                type="tel"
                value={settings.whatsapp_number || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="+54 9 11 1234-5678"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Incluí el código de país completo. Ejemplo: <code className="bg-muted px-1 py-0.5 rounded">+54 9 11 1234-5678</code>
              </p>
            </div>

            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 bg-muted/30">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="show_whatsapp" className="text-base font-semibold">
                  Mostrar botón flotante
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activá o desactivá el botón de WhatsApp en tu sitio
                </p>
              </div>
              <Switch
                id="show_whatsapp"
                checked={settings.show_whatsapp_button ?? true}
                onCheckedChange={(checked) => setSettings({...settings, show_whatsapp_button: checked})}
              />
            </div>

            {settings.whatsapp_number && (
              <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
                <p className="text-sm font-medium mb-2 text-green-900 dark:text-green-100">
                  Vista previa del enlace:
                </p>
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 dark:text-green-300 hover:underline font-mono break-all"
                >
                  https://wa.me/{settings.whatsapp_number.replace(/\D/g, '')}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información del Negocio
            </CardTitle>
            <CardDescription>
              Estos datos se mostrarán en los PDFs y en la información de contacto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Nombre del Negocio</Label>
              <Input
                id="company_name"
                value={settings.company_name || ''}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                placeholder="LA ORIGINAL"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección del Local
            </CardTitle>
            <CardDescription>
              Ubicación física de tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Calle y Número</Label>
              <Textarea
                id="address"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Av. Ejemplo 1234"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={settings.city || ''}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  placeholder="Buenos Aires"
                />
              </div>
              <div>
                <Label htmlFor="state">Provincia</Label>
                <Input
                  id="state"
                  value={settings.state || ''}
                  onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                  placeholder="Buenos Aires"
                />
              </div>
              <div>
                <Label htmlFor="zip_code">Código Postal</Label>
                <Input
                  id="zip_code"
                  value={settings.zip_code || ''}
                  onChange={(e) => setSettings({ ...settings, zip_code: e.target.value })}
                  placeholder="1234"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Otros Datos de Contacto
            </CardTitle>
            <CardDescription>
              Información adicional para que los clientes se comuniquen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono Fijo
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="contacto@laoriginal.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Sitio Web
              </Label>
              <Input
                id="website"
                type="url"
                value={settings.website || ''}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                placeholder="https://www.laoriginal.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 sticky bottom-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            size="lg"
            className="px-8 shadow-lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  )
}
