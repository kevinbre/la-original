# 🥤 LA ORIGINAL - Sistema de Distribuidora

Sistema completo de gestión de pedidos para distribuidora de bebidas con panel de administración, catálogo de productos y sistema de presupuestos.

## ✨ Características

### Para Clientes
- 🛒 **Catálogo de productos** sin precios públicos
- 👤 **Pedidos con o sin registro** - máxima flexibilidad
- 📱 **Notificación por WhatsApp** automática
- 🔍 **Búsqueda de pedidos** con código único
- 📊 **Seguimiento de estados** en tiempo real
- 📄 **Descarga de presupuestos** en PDF

### Para Administradores
- 📦 **Gestión de productos** completa (CRUD)
- 💰 **Múltiples listas de precios** personalizables
- ✏️ **Precios custom** por pedido
- 📋 **Panel de pedidos** con todos los estados
- 🎯 **Cambio de estados** de pedidos
- 📄 **Generación de facturas** automática
- 📊 **Dashboard con estadísticas**

### Estados de Pedidos
1. **Pendiente** - Recién creado
2. **En Revisión** - Admin armando presupuesto
3. **Presupuestado** - Esperando confirmación del cliente
4. **Confirmado** - Cliente aceptó
5. **En Preparación** - Preparando el pedido
6. **Listo para Entrega** - Preparado para despacho
7. **Completado** - Entregado
8. **Cancelado** - No se concretó

## 🚀 Instalación

### Prerequisitos
- Node.js 18+ instalado
- Cuenta en [Supabase](https://supabase.com) (plan gratuito)
- Cuenta en [Vercel](https://vercel.com) (plan gratuito) - opcional para deploy

### 1. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://app.supabase.com)
2. Ve a **SQL Editor** y ejecuta el archivo `supabase-schema.sql` completo
3. En **Settings > API**, copia:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon/public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 2. Configurar el Proyecto

```bash
# Clonar o descargar el proyecto
cd la-original

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env.local

# Editar .env.local con tus datos de Supabase
```

### 3. Variables de Entorno

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=5493414123456
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🔐 Crear Usuario Administrador

Después de instalar, necesitas crear tu primer usuario admin:

1. Regístrate normalmente en `/registro`
2. Ve a tu proyecto de Supabase
3. En **Table Editor > profiles**
4. Encuentra tu usuario y cambia `role` de `customer` a `admin`
5. Refresca la app y verás el menú "Admin"

## 📦 Deploy en Vercel (Gratuito)

### Opción 1: Deploy Automático

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Click en "New Project"
4. Importa tu repositorio
5. Agrega las variables de entorno
6. Deploy!

### Opción 2: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en el dashboard de Vercel
```

## 🏗️ Estructura del Proyecto

```
la-original/
├── app/                    # Páginas de Next.js 14 (App Router)
│   ├── page.tsx           # Home
│   ├── productos/         # Catálogo
│   ├── carrito/           # Carrito de compras
│   ├── login/             # Autenticación
│   ├── registro/          # Registro
│   ├── mis-pedidos/       # Pedidos del usuario
│   ├── buscar-pedido/     # Buscar por código
│   └── admin/             # Panel de administración
├── components/            # Componentes reutilizables
│   ├── Header.tsx
│   └── ProductCard.tsx
├── lib/                   # Utilidades
│   ├── supabase.ts        # Cliente de Supabase
│   ├── store.ts           # Estado global (Zustand)
│   ├── pdf.ts             # Generación de PDFs
│   └── whatsapp.ts        # Integración WhatsApp
├── types/                 # TypeScript types
│   └── index.ts
└── supabase-schema.sql    # Schema de base de datos
```

## 💾 Base de Datos

### Tablas Principales

- **profiles** - Usuarios y roles
- **products** - Productos del catálogo
- **price_lists** - Listas de precios
- **product_prices** - Precios por lista
- **orders** - Pedidos
- **order_items** - Items de pedidos
- **order_status_history** - Historial de cambios
- **invoices** - Facturas generadas

### Funciones SQL Incluidas

- `generate_order_number()` - Genera número de pedido único
- `generate_invoice_number()` - Genera número de factura único
- `generate_guest_token()` - Token para pedidos sin registro

## 🔒 Seguridad (RLS)

El proyecto incluye Row Level Security (RLS) configurado:

- ✅ Los clientes solo ven sus propios pedidos
- ✅ Los admins ven todo
- ✅ Los precios solo son visibles para admins
- ✅ Los productos son públicos (sin precios)
- ✅ Pedidos sin registro protegidos por token

## 📱 Integración WhatsApp

El sistema genera links de WhatsApp automáticos con:
- Número de pedido
- Nombre del cliente
- Link al pedido

Configura `NEXT_PUBLIC_WHATSAPP_NUMBER` con tu número de WhatsApp Business.

## 🎨 Personalización

### Colores
Edita `tailwind.config.js` para cambiar el color primario:

```js
colors: {
  primary: {
    // Cambia estos valores
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },
}
```

### Logo
Reemplaza "LA ORIGINAL" en `components/Header.tsx` con tu logo:

```tsx
<Image src="/logo.png" alt="Logo" width={150} height={40} />
```

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctas
- Asegúrate de usar `NEXT_PUBLIC_` como prefijo

### Los precios no se muestran en admin
- Verifica que tu usuario tenga `role = 'admin'` en la tabla profiles

### Error al crear pedidos
- Ejecuta el SQL schema completo
- Verifica que las funciones estén creadas correctamente

### No se generan los PDFs
- Las dependencias de jsPDF deben estar instaladas
- Verifica la consola del navegador para errores

## 📊 Flujo de Trabajo Típico

1. **Cliente** navega catálogo sin precios
2. **Cliente** agrega productos al carrito
3. **Cliente** completa datos y crea pedido
4. **Sistema** genera código único
5. **Cliente** notifica por WhatsApp (opcional)
6. **Admin** revisa pedido en panel
7. **Admin** selecciona lista de precios o agrega custom
8. **Admin** cambia estado a "Presupuestado"
9. **Sistema** permite generar PDF del presupuesto
10. **Cliente** confirma o rechaza
11. **Admin** prepara pedido
12. **Admin** genera factura final
13. **Admin** marca como completado

## 🎯 Roadmap Futuro

- [ ] Notificaciones push
- [ ] Múltiples imágenes por producto
- [ ] Historial de precios
- [ ] Reportes y analytics
- [ ] Descuentos y promociones
- [ ] Sistema de puntos/fidelidad
- [ ] App móvil nativa
- [ ] Integración con sistemas de facturación

## 🤝 Soporte

Para dudas sobre:
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para La Original.

---

Desarrollado con ❤️ por Claude para La Original
