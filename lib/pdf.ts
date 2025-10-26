import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Invoice, OrderWithItems } from '@/types'
import { supabase } from '@/lib/supabase'

export interface CompanySettings {
  company_name: string
  tagline: string | null
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  tax_id: string | null
  logo_url: string | null
}

export async function loadCompanySettings(): Promise<CompanySettings | null> {
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Error loading company settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error loading company settings:', error)
    return null
  }
}

export function generateInvoicePDF(
  invoice: Invoice | OrderWithItems,
  type: 'invoice' | 'quote' | 'order' = 'invoice',
  companySettings?: CompanySettings
) {
  const doc = new jsPDF()
  const orangeColor: [number, number, number] = [184, 92, 47]

  // Use company settings or defaults
  const companyName = companySettings?.company_name || 'LA ORIGINAL'
  const tagline = companySettings?.tagline || 'Distribuidora de Bebidas'
  const companyAddress = companySettings?.address
  const companyCity = companySettings?.city
  const companyState = companySettings?.state
  const companyPhone = companySettings?.phone
  const companyEmail = companySettings?.email
  const companyTaxId = companySettings?.tax_id

  let yPos = 20

  // Logo (if available) - left side
  if (companySettings?.logo_url) {
    try {
      // Note: In production, you'd need to load the image as base64
      // For now, we'll just reserve space for it
      doc.setDrawColor(...orangeColor)
      doc.setLineWidth(1)
      doc.rect(15, 15, 40, 40)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('LOGO', 35, 35, { align: 'center' })
    } catch (e) {
      // If logo fails, continue without it
    }
  }

  // Company info - left side
  const leftStart = companySettings?.logo_url ? 60 : 15
  doc.setFontSize(18)
  doc.setTextColor(...orangeColor)
  doc.setFont('helvetica', 'bold')
  doc.text(companyName, leftStart, yPos)

  if (tagline) {
    yPos += 6
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(tagline, leftStart, yPos)
  }

  // Company details - small text
  yPos += 6
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)

  if (companyAddress) {
    doc.text(companyAddress, leftStart, yPos)
    yPos += 4
  }

  if (companyCity || companyState) {
    const location = [companyCity, companyState].filter(Boolean).join(', ')
    doc.text(location, leftStart, yPos)
    yPos += 4
  }

  if (companyPhone) {
    doc.text(`Tel: ${companyPhone}`, leftStart, yPos)
    yPos += 4
  }

  if (companyEmail) {
    doc.text(`Email: ${companyEmail}`, leftStart, yPos)
    yPos += 4
  }

  if (companyTaxId) {
    doc.text(`CUIT: ${companyTaxId}`, leftStart, yPos)
  }

  // Document info - right side
  const docTitle = type === 'invoice' ? 'FACTURA' : type === 'quote' ? 'PRESUPUESTO' : 'PEDIDO'
  doc.setFontSize(20)
  doc.setTextColor(...orangeColor)
  doc.setFont('helvetica', 'bold')
  doc.text(docTitle, 195, 20, { align: 'right' })

  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.setFont('helvetica', 'normal')

  const docNumber = type === 'invoice'
    ? (invoice as Invoice).invoice_number
    : (invoice as OrderWithItems).order_number
  doc.text(`N°: ${docNumber}`, 195, 28, { align: 'right' })

  // Emission date
  const date = new Date(invoice.created_at).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Fecha de Emisión: ${date}`, 195, 34, { align: 'right' })

  // Delivery date for orders
  if (type !== 'invoice' && (invoice as OrderWithItems).delivery_date) {
    const deliveryDate = new Date((invoice as OrderWithItems).delivery_date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    doc.text(`Fecha de Entrega: ${deliveryDate}`, 195, 40, { align: 'right' })
  }

  // Separator line
  yPos = 60
  doc.setDrawColor(...orangeColor)
  doc.setLineWidth(0.5)
  doc.line(15, yPos, 195, yPos)

  // Customer info - simple format
  yPos += 8
  doc.setFontSize(11)
  doc.setTextColor(...orangeColor)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENTE:', 15, yPos)

  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.customer_name, 38, yPos)

  if (invoice.customer_phone) {
    doc.setTextColor(80, 80, 80)
    doc.text(`Tel: ${invoice.customer_phone}`, 110, yPos)
  }

  if (invoice.customer_email) {
    yPos += 5
    doc.setTextColor(80, 80, 80)
    doc.text(`Email: ${invoice.customer_email}`, 38, yPos)
  }

  // Items table
  yPos += 10
  const items = type === 'invoice'
    ? (invoice as Invoice).items.map(item => [
        item.product_name,
        (item as any).product_description || '',
        item.quantity.toString(),
        `$${item.unit_price.toFixed(2)}`,
        `$${item.subtotal.toFixed(2)}`
      ])
    : (invoice as OrderWithItems).items.map(item => [
        item.product_name,
        item.product_description || '',
        item.quantity.toString(),
        item.unit_price ? `$${item.unit_price.toFixed(2)}` : 'A cotizar',
        item.subtotal ? `$${item.subtotal.toFixed(2)}` : 'A cotizar'
      ])

  autoTable(doc, {
    startY: yPos,
    head: [['Producto', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: items,
    theme: 'plain',
    headStyles: {
      fillColor: orangeColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'left',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 60, fontSize: 8, textColor: [80, 80, 80] },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: orangeColor },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  })

  // Totals
  let finalY = (doc as any).lastAutoTable.finalY + 10

  // Notes if present - left side
  if (type !== 'invoice' && (invoice as OrderWithItems).notes) {
    doc.setFontSize(9)
    doc.setTextColor(...orangeColor)
    doc.setFont('helvetica', 'bold')
    doc.text('NOTAS:', 15, finalY)

    doc.setFontSize(8)
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    const notes = (invoice as OrderWithItems).notes || ''
    const splitNotes = doc.splitTextToSize(notes, 100)
    doc.text(splitNotes, 15, finalY + 5)
  }

  // Totals - right side, simple format
  const subtotal = type === 'invoice'
    ? (invoice as Invoice).subtotal
    : (invoice as OrderWithItems).total

  let totalYPos = finalY
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', 155, totalYPos, { align: 'right' })
  doc.text(`$${subtotal.toFixed(2)}`, 195, totalYPos, { align: 'right' })

  if (type === 'invoice' && (invoice as Invoice).tax > 0) {
    totalYPos += 6
    doc.text('IVA:', 155, totalYPos, { align: 'right' })
    doc.text(`$${(invoice as Invoice).tax.toFixed(2)}`, 195, totalYPos, { align: 'right' })
  }

  // Total line
  totalYPos += 2
  doc.setDrawColor(...orangeColor)
  doc.setLineWidth(0.5)
  doc.line(140, totalYPos, 195, totalYPos)

  totalYPos += 7
  doc.setFontSize(14)
  doc.setTextColor(...orangeColor)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', 155, totalYPos, { align: 'right' })
  doc.text(`$${invoice.total.toFixed(2)}`, 195, totalYPos, { align: 'right' })

  // Footer - bottom of page
  const footerY = 280
  doc.setDrawColor(...orangeColor)
  doc.setLineWidth(0.5)
  doc.line(15, footerY, 195, footerY)

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'italic')
  doc.text('Gracias por su confianza', 105, footerY + 5, { align: 'center' })

  return doc
}

export function downloadInvoicePDF(
  invoice: Invoice | OrderWithItems,
  type: 'invoice' | 'quote' | 'order' = 'invoice',
  companySettings?: CompanySettings
) {
  const doc = generateInvoicePDF(invoice, type, companySettings)
  const filename = type === 'invoice'
    ? `factura-${(invoice as Invoice).invoice_number}.pdf`
    : `pedido-${(invoice as OrderWithItems).order_number}.pdf`

  doc.save(filename)
}
