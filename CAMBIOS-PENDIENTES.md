# Cambios Pendientes - Lista de Mejoras

## Migraciones SQL Necesarias

### ✅ 1. COMPLETADO - Evitar eliminación de listas de precios usadas
```sql
-- IMPLEMENTADO: Ahora se desactivan en vez de borrar (is_active = false)
-- Ver app/admin/precios/page.tsx
```

### ✅ 2. COMPLETADO - Agregar columna de color a price_lists
```sql
-- Ya existe en migration-fixes-complete.sql
ALTER TABLE price_lists ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#b85c2f';
```

### ✅ 3. COMPLETADO - Eliminar columnas obsoletas de orders
```sql
-- Ya existe en migration-fixes-complete.sql
ALTER TABLE orders DROP COLUMN IF EXISTS quote_rejected_at;
ALTER TABLE orders DROP COLUMN IF EXISTS quote_confirmed_at;
```

### ✅ 4. COMPLETADO - Agregar guest_token para pedidos de admin
```sql
-- IMPLEMENTADO: guest_token se genera automáticamente
-- Ver app/admin/crear-pedido/page.tsx línea 259-263
```

## Cambios de UI/UX

### Listas de Precios (admin/precios)
- [✅] Cambiar DELETE por desactivación (is_active = false)
- [⏳] Agregar campo de color en formulario
- [⏳] Agregar toggle para activar/desactivar productos en cada lista
- [✅] Mejorar diseño mobile

### Clientes (admin/clientes)
- [✅] Hacer teléfonos clickeables → WhatsApp
- [✅] Cambiar DELETE por desactivación
- [✅] Agregar búsqueda
- [✅] Agregar paginación

### Productos (admin/productos)
- [✅] Agregar buscador
- [✅] Agregar paginación
- [✅] Cambiar DELETE por desactivación
- [⏳] Mostrar en qué listas está cada producto

### Crear Pedido (admin/crear-pedido)
- [✅] Rediseñar stepper para mobile (más compacto)
- [✅] Agregar botón "Volver"
- [✅] Redirigir a detalle después de crear
- [✅] Generar guest_token automáticamente

### Panel Admin (admin/page.tsx)
- [✅] Agregar buscador de pedidos
- [✅] Agregar paginación
- [✅] Agregar filtros por estado
- [✅] Agregar ordenamiento
- [✅] Usar badges coloridos

### Detalle Pedido (admin/pedidos/[id])
- [⏳] Mejorar stepper mobile
- [✅] Usar badges coloridos para estados
- [✅] Agregar botón "Copiar URL para cliente" (con token)
- [⏳] Mejorar PDF:
  - Logo como watermark translúcido
  - Footer con dirección completa de config

### Mis Pedidos (mis-pedidos)
- [✅] Badges ya tienen colores ✓

## Funcionalidades Nuevas

### Recuperación de Contraseña
- [⏳] Página /recuperar-contraseña
- [⏳] Integración con Supabase Auth
- Ver código en CAMBIOS-IMPLEMENTADOS.md

### Botón Flotante WhatsApp
- [⏳] Componente FloatingWhatsApp
- [⏳] Agregar config en company_settings (SQL ya creado)
- [⏳] Toggle on/off desde admin/configuracion
- Ver código en CAMBIOS-IMPLEMENTADOS.md

### Notificaciones iOS
- [✅] Ajustar posición de Toaster para evitar notch/Dynamic Island
- [✅] Usar padding-top: safe-area-inset-top (pt-safe)

## Prioridad Alta ✅ MAYORMENTE COMPLETADO

1. ✅ Fix eliminación price_lists/products (cambiar a desactivación)
2. ✅ Agregar buscadores y paginación
3. ✅ Badges coloridos en todos lados
4. ✅ Fix stepper mobile
5. ⏳ Fix PDF con logo watermark

## Prioridad Media

6. ✅ WhatsApp en teléfonos
7. ✅ Botón copiar URL
8. ⏳ Recuperar contraseña (código listo, falta implementar)
9. ⏳ Colores en price lists (SQL listo, falta formulario)

## Prioridad Baja

10. ⏳ Botón flotante WhatsApp (código listo, falta implementar)
11. ✅ Mejoras visuales generales

## 📊 Progreso Total

**Completado**: 17/25 items (68%)
**Pendiente**: 8/25 items (32%)

### Items Pendientes (8):
1. Campo de color en formulario de listas de precios
2. Toggle de productos en listas de precios (is_active en product_prices)
3. Mostrar en qué listas está cada producto
4. Mejorar stepper mobile en detalle de pedido
5. PDF con logo watermark y footer
6. Página de recuperación de contraseña
7. Botón flotante WhatsApp
8. Config de WhatsApp en admin

**Todos estos items pendientes tienen el código completo en CAMBIOS-IMPLEMENTADOS.md**
