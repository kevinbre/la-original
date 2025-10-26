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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://laoriginal.vercel.app'
  let message = `Hola! Soy ${customerName} y acabo de realizar un pedido en La Original.\n\n`
  message += `*Código de Pedido:* ${orderNumber}\n`

  if (guestToken) {
    message += `*Token de Acceso:* ${guestToken}\n`
  }

  // Use different URL structure based on whether it's a guest order or admin order
  if (guestToken) {
    message += `\nPueden ver los detalles en: ${appUrl}/pedido/${orderNumber}?token=${guestToken}`
  } else {
    // Admin orders don't need token
    message += `\nPueden ver los detalles en: ${appUrl}/pedido/${orderNumber}`
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
