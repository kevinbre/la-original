import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Invoice, OrderWithItems } from '@/types'

export function generateInvoicePDF(invoice: Invoice | OrderWithItems, type: 'invoice' | 'quote' | 'order' = 'invoice') {
  const doc = new jsPDF()

  // Header with background
  doc.setFillColor(240, 240, 240)
  doc.rect(0, 0, 210, 35, 'F')

  doc.setFontSize(28)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('LA ORIGINAL', 20, 18)

  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.setFont('helvetica', 'normal')
  doc.text('Distribuidora de Bebidas', 20, 26)

  // Document info
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  const docTitle = type === 'invoice' ? 'FACTURA' : type === 'quote' ? 'PRESUPUESTO' : 'PEDIDO'
  doc.text(docTitle, 150, 16)

  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.setFont('helvetica', 'normal')
  const docNumber = type === 'invoice'
    ? (invoice as Invoice).invoice_number
    : (invoice as OrderWithItems).order_number
  doc.text(`Nº: ${docNumber}`, 150, 23)

  const date = new Date(invoice.created_at).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Fecha: ${date}`, 150, 29)

  // Delivery date for orders
  if (type !== 'invoice' && (invoice as OrderWithItems).delivery_date) {
    const deliveryDate = new Date((invoice as OrderWithItems).delivery_date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    doc.text(`Entrega: ${deliveryDate}`, 150, 35)
  }

  // Customer info box
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(20, 42, 170, 28, 2, 2, 'FD')

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMACIÓN DEL CLIENTE', 25, 49)

  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nombre: ${invoice.customer_name}`, 25, 56)

  if (invoice.customer_phone) {
    doc.text(`Teléfono: ${invoice.customer_phone}`, 25, 62)
  }

  if (invoice.customer_email) {
    doc.text(`Email: ${invoice.customer_email}`, 110, 62)
  }

  // Items table with product description
  const items = type === 'invoice'
    ? (invoice as Invoice).items.map(item => [
        item.product_name,
        '', // Description column (invoices don't have descriptions)
        item.quantity.toString(),
        `$${item.unit_price.toFixed(2)}`,
        `$${item.subtotal.toFixed(2)}`
      ])
    : (invoice as OrderWithItems).items.map(item => [
        item.product_name,
        item.product_description || '-',
        item.quantity.toString(),
        item.unit_price ? `$${item.unit_price.toFixed(2)}` : 'A cotizar',
        item.subtotal ? `$${item.subtotal.toFixed(2)}` : 'A cotizar'
      ])

  autoTable(doc, {
    startY: 78,
    head: [['Producto', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: items,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 65, fontSize: 8, textColor: [80, 80, 80] },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
  })
  
  // Totals
  let finalY = (doc as any).lastAutoTable.finalY + 10

  // Add notes section if present
  if (type !== 'invoice' && (invoice as OrderWithItems).notes) {
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(255, 255, 240)
    doc.roundedRect(20, finalY, 100, 30, 2, 2, 'FD')

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('NOTAS DEL PEDIDO:', 25, finalY + 7)

    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    const notes = (invoice as OrderWithItems).notes || ''
    const splitNotes = doc.splitTextToSize(notes, 90)
    doc.text(splitNotes, 25, finalY + 13)
  }

  // Totals box
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(125, finalY, 65, 28, 2, 2, 'FD')

  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.setFont('helvetica', 'normal')

  const subtotal = type === 'invoice'
    ? (invoice as Invoice).subtotal
    : (invoice as OrderWithItems).total

  doc.text('Subtotal:', 130, finalY + 8)
  doc.text(`$${subtotal.toFixed(2)}`, 185, finalY + 8, { align: 'right' })

  if (type === 'invoice' && (invoice as Invoice).tax > 0) {
    doc.text('IVA:', 130, finalY + 15)
    doc.text(`$${(invoice as Invoice).tax.toFixed(2)}`, 185, finalY + 15, { align: 'right' })
  }

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  const totalY = type === 'invoice' && (invoice as Invoice).tax > 0 ? finalY + 22 : finalY + 15
  doc.text('TOTAL:', 130, totalY)
  doc.text(`$${invoice.total.toFixed(2)}`, 185, totalY, { align: 'right' })

  // Footer with professional message
  const footerY = 275
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(20, footerY, 190, footerY)

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text('Gracias por su confianza', 105, footerY + 5, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text('LA ORIGINAL - Distribuidora de Bebidas', 105, footerY + 10, { align: 'center' })

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'normal')
  doc.text('Consultas y pedidos: contacto@laoriginal.com', 105, footerY + 15, { align: 'center' })

  return doc
}

export function downloadInvoicePDF(invoice: Invoice | OrderWithItems, type: 'invoice' | 'quote' | 'order' = 'invoice') {
  const doc = generateInvoicePDF(invoice, type)
  const filename = type === 'invoice' 
    ? `factura-${(invoice as Invoice).invoice_number}.pdf`
    : `presupuesto-${(invoice as OrderWithItems).order_number}.pdf`
  
  doc.save(filename)
}
