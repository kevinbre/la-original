import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Invoice, OrderWithItems } from '@/types'
import { supabase } from '@/lib/supabase'

// Helper function to format numbers with Argentine format (1.234,56)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Helper function to load image as base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    // If it's a relative URL, make it absolute
    const imageUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error loading image:', error)
    return null
  }
}

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

export async function generateInvoicePDF(
  invoice: Invoice | OrderWithItems,
  type: 'invoice' | 'quote' | 'order' = 'invoice',
  companySettings?: CompanySettings
) {
  const doc = new jsPDF()
  const orangeColor: [number, number, number] = [184, 92, 47]

  // Load logo image if available
  const logoUrl = companySettings?.logo_url || '/logo.png'
  const logoBase64 = await loadImageAsBase64(logoUrl)

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

  // Add watermark logo in center (large, transparent)
  if (logoBase64) {
    try {
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const watermarkSize = 120
      const watermarkX = (pageWidth - watermarkSize) / 2
      const watermarkY = (pageHeight - watermarkSize) / 2

      // Set opacity for watermark
      doc.saveGraphicsState()
      // @ts-ignore - GState exists but TypeScript doesn't recognize it
      doc.setGState(new doc.GState({ opacity: 0.1 }))
      doc.addImage(logoBase64, 'PNG', watermarkX, watermarkY, watermarkSize, watermarkSize)
      doc.restoreGraphicsState()
    } catch (e) {
      console.error('Error adding watermark:', e)
    }
  }

  // Logo in top left corner
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 15, 15, 35, 35)
    } catch (e) {
      console.error('Error adding logo:', e)
    }
  }

  // Company info - right of logo
  const leftStart = logoBase64 ? 55 : 15
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
    ? (invoice as Invoice).items.map(item => {
        const itemAny = item as any
        const unit = itemAny.product_unit || 'unidad'
        const unitsPerPack = itemAny.product_units_per_pack
        const unitDisplay = unitsPerPack ? `${unit} x${unitsPerPack}` : unit

        return [
          item.product_name,
          itemAny.product_description || '',
          unitDisplay,
          item.quantity.toString(),
          `$${formatCurrency(item.unit_price)}`,
          `$${formatCurrency(item.subtotal)}`
        ]
      })
    : (invoice as OrderWithItems).items.map(item => {
        const itemAny = item as any
        const unit = itemAny.product_unit || 'unidad'
        const unitsPerPack = itemAny.product_units_per_pack
        const unitDisplay = unitsPerPack ? `${unit} x${unitsPerPack}` : unit

        return [
          item.product_name,
          item.product_description || '',
          unitDisplay,
          item.quantity.toString(),
          item.unit_price ? `$${formatCurrency(item.unit_price)}` : 'A cotizar',
          item.subtotal ? `$${formatCurrency(item.subtotal)}` : 'A cotizar'
        ]
      })

  autoTable(doc, {
    startY: yPos,
    head: [['Producto', 'Descripción', 'Unidad', 'Cant.', 'Precio Unit.', 'Subtotal']],
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
      overflow: 'linebreak',
      cellWidth: 'wrap',
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold', overflow: 'linebreak' },
      1: { cellWidth: 35, fontSize: 8, textColor: [80, 80, 80], overflow: 'linebreak', cellPadding: 2 },
      2: { cellWidth: 22, fontSize: 8, textColor: [80, 80, 80], overflow: 'linebreak' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 32, halign: 'right', minCellWidth: 32 },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: orangeColor, minCellWidth: 32 },
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
  doc.text(`$${formatCurrency(subtotal)}`, 195, totalYPos, { align: 'right' })

  if (type === 'invoice' && (invoice as Invoice).tax > 0) {
    totalYPos += 6
    doc.text('IVA:', 155, totalYPos, { align: 'right' })
    doc.text(`$${formatCurrency((invoice as Invoice).tax)}`, 195, totalYPos, { align: 'right' })
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
  doc.text(`$${formatCurrency(invoice.total)}`, 195, totalYPos, { align: 'right' })

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

export async function downloadInvoicePDF(
  invoice: Invoice | OrderWithItems,
  type: 'invoice' | 'quote' | 'order' = 'invoice',
  companySettings?: CompanySettings
) {
  const doc = await generateInvoicePDF(invoice, type, companySettings)
  const filename = type === 'invoice'
    ? `factura-${(invoice as Invoice).invoice_number}.pdf`
    : `pedido-${(invoice as OrderWithItems).order_number}.pdf`

  doc.save(filename)
}
