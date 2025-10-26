import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Invoice, OrderWithItems } from '@/types'

export function generateInvoicePDF(invoice: Invoice | OrderWithItems, type: 'invoice' | 'quote' | 'order' = 'invoice') {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(24)
  doc.setTextColor(14, 165, 233) // primary-500
  doc.text('LA ORIGINAL', 20, 20)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Distribuidora de Bebidas', 20, 27)
  
  // Document info
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  const docTitle = type === 'invoice' ? 'FACTURA' : 'PRESUPUESTO'
  doc.text(docTitle, 150, 20)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  const docNumber = type === 'invoice' 
    ? (invoice as Invoice).invoice_number 
    : (invoice as OrderWithItems).order_number
  doc.text(`Nº: ${docNumber}`, 150, 27)
  
  const date = new Date(invoice.created_at).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Fecha: ${date}`, 150, 33)
  
  // Customer info
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('CLIENTE', 20, 45)
  
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(invoice.customer_name, 20, 52)
  
  if (invoice.customer_phone) {
    doc.text(`Tel: ${invoice.customer_phone}`, 20, 58)
  }
  
  if (invoice.customer_email) {
    doc.text(`Email: ${invoice.customer_email}`, 20, 64)
  }
  
  // Items table
  const items = type === 'invoice' 
    ? (invoice as Invoice).items.map(item => [
        item.product_name,
        item.quantity.toString(),
        `$${item.unit_price.toFixed(2)}`,
        `$${item.subtotal.toFixed(2)}`
      ])
    : (invoice as OrderWithItems).items.map(item => [
        item.product_name,
        item.quantity.toString(),
        item.unit_price ? `$${item.unit_price.toFixed(2)}` : 'Sin precio',
        item.subtotal ? `$${item.subtotal.toFixed(2)}` : 'Sin precio'
      ])
  
  autoTable(doc, {
    startY: 75,
    head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
    body: items,
    theme: 'striped',
    headStyles: {
      fillColor: [14, 165, 233],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  })
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10
  
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  
  const subtotal = type === 'invoice' 
    ? (invoice as Invoice).subtotal 
    : (invoice as OrderWithItems).total
  
  doc.text(`Subtotal:`, 130, finalY)
  doc.text(`$${subtotal.toFixed(2)}`, 180, finalY, { align: 'right' })
  
  if (type === 'invoice' && (invoice as Invoice).tax > 0) {
    doc.text(`IVA:`, 130, finalY + 7)
    doc.text(`$${(invoice as Invoice).tax.toFixed(2)}`, 180, finalY + 7, { align: 'right' })
  }
  
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  const totalY = type === 'invoice' && (invoice as Invoice).tax > 0 ? finalY + 14 : finalY + 7
  doc.text(`TOTAL:`, 130, totalY)
  doc.text(`$${invoice.total.toFixed(2)}`, 180, totalY, { align: 'right' })
  
  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.setFont('helvetica', 'normal')
  doc.text('Gracias por su compra', 105, 280, { align: 'center' })
  doc.text('La Original - Distribuidora de Bebidas', 105, 285, { align: 'center' })
  
  return doc
}

export function downloadInvoicePDF(invoice: Invoice | OrderWithItems, type: 'invoice' | 'quote' | 'order' = 'invoice') {
  const doc = generateInvoicePDF(invoice, type)
  const filename = type === 'invoice' 
    ? `factura-${(invoice as Invoice).invoice_number}.pdf`
    : `presupuesto-${(invoice as OrderWithItems).order_number}.pdf`
  
  doc.save(filename)
}
