export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function generateOrderWhatsAppMessage(
  orderNumber: string,
  customerName: string,
  guestToken?: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  let message = `Hola! Soy ${customerName} y acabo de realizar un pedido en La Original.\n\n`
  message += `*Código de Pedido:* ${orderNumber}\n`

  if (guestToken) {
    message += `*Token de Acceso:* ${guestToken}\n`
  }

  message += `\nPueden ver los detalles en: ${appUrl}/pedidos/${orderNumber}`

  if (guestToken) {
    message += `?token=${guestToken}`
  }

  return message
}

export function openWhatsAppWithOrder(
  orderNumber: string,
  customerName: string,
  phoneNumber?: string,
  guestToken?: string
) {
  const whatsappNumber = phoneNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  const message = generateOrderWhatsAppMessage(orderNumber, customerName, guestToken)
  const link = generateWhatsAppLink(whatsappNumber, message)
  window.open(link, '_blank')
}
