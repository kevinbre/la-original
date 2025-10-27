# Instrucciones de Implementación - Mejoras Solicitadas

## 🚀 PASOS A SEGUIR

### 1. Ejecutar Migraciones SQL (PRIMERO)

Ejecutá en Supabase SQL Editor:

```sql
-- Ver archivo: migration-fixes-complete.sql
```

### 2. Cambios Inmediatos Críticos

#### A. Fix Notificaciones iOS (Toaster)
**Archivo**: `app/layout.tsx`
```tsx
// Cambiar línea 47:
<Toaster richColors position="top-right" />
// Por:
<Toaster richColors position="top-right" className="pt-safe" />
```

#### B. Usar OrderStatusBadge en todos lados
Ya creé el componente en `components/OrderStatusBadge.tsx`

**Lugares para usar**:
1. `app/admin/page.tsx` - En la lista de pedidos
2. `app/admin/pedidos/[id]/page.tsx` - En el detalle
3. `app/pedido/[id]/page.tsx` - En vista cliente
4. `app/pedidos/[id]/confirmar/page.tsx`

**Ejemplo de uso**:
```tsx
import { OrderStatusBadge } from '@/components/OrderStatusBadge'

// En lugar de Badge:
<OrderStatusBadge status={order.status} />
```

#### C. Fix Stepper Mobile - Crear Pedido
**Archivo**: `app/admin/crear-pedido/page.tsx` línea ~312

**Cambiar de**:
```tsx
<div className="mb-8 flex items-center justify-center gap-4">
```

**A**:
```tsx
<div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
```

Y cada paso de:
```tsx
<div className={`h-1 w-16 rounded ...`}></div>
```

A:
```tsx
<div className={`h-1 w-8 sm:w-16 rounded ...`}></div>
```

#### D. Agregar Botón Volver en Crear Pedido
**Archivo**: `app/admin/crear-pedido/page.tsx` después de la línea 306

```tsx
<div className="mb-8">
  <Button variant="ghost" onClick={() => router.push('/admin')} className="mb-4">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Volver al Panel
  </Button>
  <h1 className="text-3xl font-bold mb-2">Crear Nuevo Pedido</h1>
  <p className="text-muted-foreground">Completá los 3 pasos para generar el pedido</p>
</div>
```

Agregar import:
```tsx
import { ArrowLeft } from 'lucide-react'
```

#### E. Redirigir después de crear pedido
**Archivo**: `app/admin/crear-pedido/page.tsx` línea ~287

**Cambiar**:
```tsx
toast.success(`Pedido ${order.order_number} creado exitosamente`)
router.push('/admin')
router.refresh()
```

**Por**:
```tsx
toast.success(`Pedido ${order.order_number} creado exitosamente`)
router.push(`/admin/pedidos/${order.id}`)
```

### 3. Eliminar Listas de Precios - Desactivar en vez de Borrar

**Archivo**: `app/admin/precios/page.tsx`

Buscar función `deleteList` y cambiarla por:

```tsx
const toggleListActive = async (list: PriceList) => {
  try {
    const { error } = await supabase
      .from('price_lists')
      .update({ is_active: !list.is_active })
      .eq('id', list.id)

    if (error) throw error

    toast.success(list.is_active ? 'Lista desactivada' : 'Lista activada')
    loadData()
  } catch (error: any) {
    toast.error('Error al cambiar estado de la lista')
  }
}
```

Cambiar el botón de:
```tsx
<Trash2 /> Eliminar
```

A:
```tsx
{list.is_active ? (
  <>
    <X className="mr-2 h-4 w-4" />
    Desactivar
  </>
) : (
  <>
    <Check className="mr-2 h-4 w-4" />
    Activar
  </>
)}
```

### 4. Teléfonos clickeables → WhatsApp

**Archivo**: `app/admin/clientes/page.tsx`

Buscar donde muestra el teléfono y cambiar por:

```tsx
<a
  href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-primary hover:underline flex items-center gap-1"
>
  <Phone className="h-3 w-3" />
  {customer.phone}
</a>
```

Agregar import:
```tsx
import { Phone } from 'lucide-react'
```

### 5. Generar guest_token para pedidos de admin

**Archivo**: `app/admin/crear-pedido/page.tsx` línea ~250

Después de generar el order_number, agregar:

```tsx
// Generate guest token for sharing
const { data: guestToken } = await supabase.rpc('generate_guest_token')
if (!guestToken) throw new Error('Failed to generate guest token')
```

Y en el insert agregar:
```tsx
guest_token: guestToken,
```

### 6. Botón Copiar URL en Detalle

**Archivo**: `app/admin/pedidos/[id]/page.tsx`

Agregar botón en el header del pedido:

```tsx
<Button
  variant="outline"
  onClick={() => {
    const url = `${window.location.origin}/pedido/${order.order_number}${order.guest_token ? `?token=${order.guest_token}` : ''}`
    navigator.clipboard.writeText(url)
    toast.success('URL copiada al portapapeles')
  }}
>
  <Link2 className="mr-2 h-4 w-4" />
  Copiar URL para Cliente
</Button>
```

Import:
```tsx
import { Link2 } from 'lucide-react'
```

### 7. Buscadores y Paginación

**Para admin/productos**, **admin/clientes**, **admin/page.tsx**:

Agregar state:
```tsx
const [searchTerm, setSearchTerm] = useState('')
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 10
```

Agregar buscador:
```tsx
<div className="mb-4">
  <div className="relative">
    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Buscar..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-9"
    />
  </div>
</div>
```

Filtrar y paginar:
```tsx
const filtered = items.filter(item =>
  item.name?.toLowerCase().includes(searchTerm.toLowerCase())
)

const totalPages = Math.ceil(filtered.length / itemsPerPage)
const paginatedItems = filtered.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
)
```

Agregar paginador:
```tsx
<div className="flex justify-center gap-2 mt-4">
  <Button
    variant="outline"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(p => p - 1)}
  >
    Anterior
  </Button>
  <span className="flex items-center px-4">
    Página {currentPage} de {totalPages}
  </span>
  <Button
    variant="outline"
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage(p => p + 1)}
  >
    Siguiente
  </Button>
</div>
```

## 📝 RESUMEN DE ARCHIVOS A MODIFICAR

1. ✅ `migration-fixes-complete.sql` - EJECUTAR PRIMERO
2. `app/layout.tsx` - Fix toaster iOS
3. `components/OrderStatusBadge.tsx` - Ya creado ✓
4. `app/admin/crear-pedido/page.tsx` - Stepper, volver, redirect, guest_token
5. `app/admin/precios/page.tsx` - Desactivar en vez de borrar
6. `app/admin/productos/page.tsx` - Búsqueda, paginación, desactivar
7. `app/admin/clientes/page.tsx` - WhatsApp links, búsqueda
8. `app/admin/page.tsx` - Badges, búsqueda, filtros
9. `app/admin/pedidos/[id]/page.tsx` - Badges, copiar URL, stepper mobile
10. `lib/pdf.ts` - Logo watermark (próximo paso)

## 🎨 Para el PDF con Logo Watermark

Necesitás convertir el logo a base64 primero:

```bash
node -e "const fs = require('fs'); const img = fs.readFileSync('public/logo.png'); console.log(img.toString('base64'));" > logo-base64.txt
```

Luego en `lib/pdf.ts` agregar el logo como watermark translúcido en el centro.

---

**NOTA**: Estos son los cambios más críticos. Implementalos en este orden para mejor resultado.
