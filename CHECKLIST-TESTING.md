# ✅ Checklist de Testing - LA ORIGINAL

## 🔧 Antes de Empezar

### Migraciones SQL (OBLIGATORIO)
- [ ] Ejecutar `migration-company-settings.sql` en Supabase
- [ ] Ejecutar `migration-update-order-statuses.sql` en Supabase
- [ ] Ejecutar `migration-fixes-complete.sql` en Supabase
- [ ] Verificar que no hubo errores en la consola de SQL

---

## 📱 Testing por Página

### 1. Panel Admin (`/admin`)
- [ ] El buscador filtra por número de pedido
- [ ] El buscador filtra por nombre de cliente
- [ ] El buscador filtra por teléfono
- [ ] Los badges de estado tienen colores (amarillo, verde, naranja, azul, gris)
- [ ] La paginación funciona (Anterior/Siguiente)
- [ ] Muestra "Página X de Y"
- [ ] Los filtros por estado funcionan

### 2. Crear Pedido (`/admin/crear-pedido`)
- [ ] Aparece el botón "Volver al Panel" arriba a la izquierda
- [ ] El botón de volver funciona
- [ ] El stepper se ve bien en desktop (horizontal)
- [ ] El stepper se ve bien en mobile (vertical, compacto)
- [ ] Al crear un pedido → redirecciona a `/admin/pedidos/[id]`
- [ ] NO redirecciona al panel admin

### 3. Detalle de Pedido (`/admin/pedidos/[id]`)
- [ ] Aparece el botón "Copiar URL"
- [ ] Al hacer click se copia al portapapeles
- [ ] Muestra toast "URL copiada al portapapeles"
- [ ] La URL tiene formato: `/pedido/PED-XXX?token=...`
- [ ] Al abrir la URL en incógnito se puede ver el pedido sin login

### 4. Listas de Precios (`/admin/precios`)
- [ ] Ya NO existe el botón de eliminar (ícono de basura)
- [ ] Existe un botón de "Desactivar" (cuando está activa)
- [ ] Existe un botón de "Activar" (cuando está inactiva)
- [ ] Al desactivar muestra confirmación
- [ ] Al desactivar cambia el estado correctamente
- [ ] Al activar cambia el estado correctamente
- [ ] Los pedidos viejos NO se rompen al desactivar una lista

### 5. Productos (`/admin/productos`)
- [ ] Aparece el buscador arriba a la derecha
- [ ] Buscar por nombre funciona
- [ ] Buscar por categoría funciona
- [ ] Buscar por descripción funciona
- [ ] Muestra "X de Y productos"
- [ ] La paginación funciona correctamente
- [ ] Ya NO existe el botón de eliminar
- [ ] Existe el toggle Activo/Inactivo
- [ ] El toggle tiene ícono verde cuando está activo (Power)
- [ ] El toggle tiene ícono gris cuando está inactivo (PowerOff)
- [ ] Los items de pedidos viejos NO se rompen al desactivar un producto

### 6. Clientes (`/admin/clientes`)
- [ ] El buscador ya existía y funciona
- [ ] Los teléfonos son clickeables (tienen ícono de WhatsApp)
- [ ] Los teléfonos tienen color verde
- [ ] Al hacer click en un teléfono abre WhatsApp Web
- [ ] El número se formatea correctamente (sin espacios/guiones)
- [ ] La paginación funciona
- [ ] El botón de toggle ya NO es el de basura
- [ ] El botón de toggle es Power/PowerOff
- [ ] El toggle tiene color naranja para desactivar
- [ ] El toggle tiene color verde para activar

---

## 🎨 Testing Visual (Mobile)

### iOS Safari / Chrome Mobile
- [ ] Las notificaciones toast NO se ocultan detrás del notch
- [ ] Las notificaciones toast NO se ocultan detrás de la Dynamic Island
- [ ] El stepper en crear-pedido se ve correctamente (vertical)
- [ ] Las líneas del stepper son cortas (no ocupan toda la pantalla)

### Android Chrome
- [ ] Todo se ve bien en mobile
- [ ] Los botones son clickeables
- [ ] No hay overflow horizontal

---

## 🔄 Testing de Flujo Completo

### Flujo 1: Crear y Compartir Pedido
1. [ ] Login como admin
2. [ ] Ir a "Crear Pedido"
3. [ ] Seleccionar cliente
4. [ ] Agregar productos
5. [ ] Verificar precios
6. [ ] Crear pedido
7. [ ] **Verificar que redirecciona a detalle** (no al panel)
8. [ ] Click en "Copiar URL"
9. [ ] Abrir en navegador incógnito
10. [ ] **Verificar que se ve el pedido sin login**

### Flujo 2: Desactivar Lista de Precios
1. [ ] Crear un pedido con una lista de precios específica
2. [ ] Ir a Listas de Precios
3. [ ] Desactivar esa lista
4. [ ] Volver al pedido creado
5. [ ] **Verificar que el pedido se sigue viendo bien**
6. [ ] **No debe haber error 404 o foreign key**

### Flujo 3: Desactivar Producto
1. [ ] Crear un pedido con un producto específico
2. [ ] Ir a Productos
3. [ ] Desactivar ese producto
4. [ ] Volver al pedido creado
5. [ ] **Verificar que el item del pedido se sigue viendo**
6. [ ] **No debe haber error 404 o foreign key**

### Flujo 4: Buscar y Filtrar
1. [ ] Ir al panel admin
2. [ ] Buscar un pedido por número
3. [ ] Buscar un pedido por cliente
4. [ ] Filtrar por estado "pendiente"
5. [ ] Cambiar de página en la paginación
6. [ ] **Verificar que todo funciona correctamente**

### Flujo 5: WhatsApp desde Clientes
1. [ ] Ir a Clientes
2. [ ] Buscar un cliente
3. [ ] Click en el teléfono
4. [ ] **Verificar que abre WhatsApp Web**
5. [ ] **Verificar que el número está correcto**

---

## ❌ Errores Conocidos a Verificar

### Estos errores YA NO deberían pasar:
- [ ] ✅ "foreign key constraint" al eliminar lista de precios
- [ ] ✅ "foreign key constraint" al eliminar producto
- [ ] ✅ "quote_rejected_at column doesn't exist"
- [ ] ✅ "quote_confirmed_at column doesn't exist"
- [ ] ✅ Redirect incorrecto después de crear pedido
- [ ] ✅ Stepper mobile roto
- [ ] ✅ No se puede compartir pedido sin login
- [ ] ✅ Toast notifications ocultas en iOS

---

## 📊 Resumen

- **Total Items**: 65
- **Críticos**: 20
- **Importantes**: 25
- **Visuales**: 10
- **Flujos Completos**: 10

---

## 🚨 Si Encontrás Errores

### Error: Column doesn't exist
→ Ejecutar las migraciones SQL que faltan

### Error: Can't read property of undefined
→ Verificar que ejecutaste las 3 migraciones en orden

### Error: Foreign key constraint
→ Algo raro pasó, revisar los logs de Supabase

### El stepper se ve raro en mobile
→ Hard refresh (Ctrl+Shift+R) para limpiar cache

### Los badges no tienen colores
→ Verificar que el archivo `components/OrderStatusBadge.tsx` existe

---

**Último paso**: Cuando todos los checks estén ✅, estás listo para deploy a producción 🚀
