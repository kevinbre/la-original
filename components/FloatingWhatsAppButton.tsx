'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageCircle } from 'lucide-react'

interface CompanySettings {
  whatsapp_number?: string
  show_whatsapp_button?: boolean
}

export function FloatingWhatsAppButton() {
  const [config, setConfig] = useState<CompanySettings | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const { data } = await supabase
      .from('company_settings')
      .select('whatsapp_number, show_whatsapp_button')
      .single()
    setConfig(data)
  }

  if (!config?.show_whatsapp_button || !config?.whatsapp_number) return null

  return (
    <a
      href={`https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-110 animate-in fade-in duration-300"
      title="Contactanos por WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
