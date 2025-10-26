'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Building2, Save, Upload } from 'lucide-react'

interface CompanySettings {
  id: string
  company_name: string
  tagline: string
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  phone: string | null
  email: string | null
  website: string | null
  tax_id: string | null
  logo_url: string | null
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<CompanySettings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single()

      if (error) {
        // If no settings exist, create default
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: insertError } = await supabase
            .from('company_settings')
            .insert({
              company_name: 'LA ORIGINAL',
              tagline: 'Distribuidora de Bebidas',
              email: 'contacto@laoriginal.com'
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

    setLoading(true)
    try {
      const { error } = await supabase
        .from('company_settings')
        .update({
          company_name: settings.company_name,
          tagline: settings.tagline,
          address: settings.address,
          city: settings.city,
          state: settings.state,
          zip_code: settings.zip_code,
          phone: settings.phone,
          email: settings.email,
          website: settings.website,
          tax_id: settings.tax_id,
          logo_url: settings.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)

      if (error) throw error

      toast.success('Configuración guardada exitosamente')
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          Configuración de la Empresa
        </h1>
        <p className="text-muted-foreground">
          Esta información se mostrará en los PDFs de pedidos y facturas
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Nombre y descripción de la empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Nombre de la Empresa *</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                placeholder="LA ORIGINAL"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Eslogan / Descripción</Label>
              <Input
                id="tagline"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="Distribuidora de Bebidas"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>Datos para que los clientes puedan contactarte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={settings.website || ''}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                placeholder="https://www.laoriginal.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Dirección del Local</CardTitle>
            <CardDescription>Ubicación física de la empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Dirección</Label>
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

        {/* Tax Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Fiscal</CardTitle>
            <CardDescription>Datos impositivos de la empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="tax_id">CUIT / CUIL</Label>
              <Input
                id="tax_id"
                value={settings.tax_id || ''}
                onChange={(e) => setSettings({ ...settings, tax_id: e.target.value })}
                placeholder="20-12345678-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logo de la Empresa</CardTitle>
            <CardDescription>
              URL del logo que aparecerá en los PDFs (actualmente se usa /logo.png por defecto)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="logo_url">URL del Logo</Label>
              <div className="flex gap-2">
                <Input
                  id="logo_url"
                  value={settings.logo_url || '/logo.png'}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  placeholder="/logo.png"
                />
              </div>
              {settings.logo_url && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                  <img
                    src={settings.logo_url || '/logo.png'}
                    alt="Logo preview"
                    className="h-16 object-contain"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button onClick={handleSave} disabled={loading} size="lg" className="px-8">
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  )
}
