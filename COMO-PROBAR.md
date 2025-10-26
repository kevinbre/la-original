# 🧪 Cómo Probar Todo lo Implementado

## 📝 Guía Paso a Paso

---

## 1. 🔵 Verificar Logo en la Aplicación

### Header (Navegación)
```bash
1. Abrir: http://localhost:3000
2. Verificar en la esquina superior izquierda:
   ✅ Logo redondo de "La Original" (10x10 px)
   ✅ Al lado el texto "LA ORIGINAL"
   ✅ Logo tiene el diseño azul vintage
3. Click en el logo → debería ir a la página principal
```

### Footer (Pie de página)
```bash
1. Scroll hasta abajo en cualquier página
2. Verificar en el centro:
   ✅ Logo de "La Original" (20x20 px)
   ✅ Texto "LA ORIGINAL" debajo
   ✅ "Distribuidora de Bebidas"
   ✅ Copyright "© 2024 La Original..."
```

### Favicon (Pestaña del navegador)
```bash
1. Mirar la pestaña del navegador
2. Verificar:
   ✅ Ícono pequeño de "La Original" al lado del título
   ✅ Texto: "La Original - Distribuidora de Bebidas"
```

---

## 2. 🛒 Crear Pedido como Admin

### Acceso
```bash
1. Ir a: http://localhost:3000/admin
2. Buscar el botón "Crear Pedido" (azul con gradiente)
3. Click en "Crear Pedido"
4. Verificar que abre: /admin/crear-pedido
```

### Seleccionar Cliente
```bash
1. Click en el campo "Seleccionar cliente..."
2. Debe abrirse un popover con lista de clientes
3. Escribir en el buscador (ej: "Juan")
4. Los resultados se filtran en tiempo real
5. Click en un cliente
6. Verificar:
   ✅ Cliente seleccionado se muestra en el campo
   ✅ Aparece un box gris con información del cliente:
      - Teléfono
      - Email (si tiene)
      - Ciudad (si tiene)
      - Dirección (si tiene)
```

### Agregar Productos
```bash
1. Click en "Agregar Producto"
2. Debe abrirse popover con productos
3. Buscar un producto (ej: "Coca")
4. Click en un producto
5. Verificar que aparece en la lista con:
   ✅ Nombre del producto
   ✅ Descripción (si tiene)
   ✅ Input de cantidad (default: 1)
   ✅ Input de precio (default: 0.00) ⭐ IMPORTANTE
   ✅ Subtotal calculado automáticamente
   ✅ Botón de eliminar (X rojo)
```

### ⭐ Cambiar Precio (FEATURE PRINCIPAL)
```bash
1. En el producto agregado, buscar "Precio Unitario ($)"
2. Click en el input
3. Escribir un precio (ej: 150.50)
4. Verificar:
   ✅ Subtotal se actualiza automáticamente
   ✅ Total en el sidebar se actualiza
   ✅ Cálculo: subtotal = cantidad × precio
```

### Cambiar Cantidad
```bash
1. En el input "Cantidad"
2. Cambiar el número (ej: de 1 a 5)
3. Verificar:
   ✅ Subtotal se actualiza: 5 × precio
   ✅ Total general se actualiza
```

### Agregar Varios Productos
```bash
1. Repetir "Agregar Producto" varias veces
2. Poner diferentes precios a cada uno
3. Verificar:
   ✅ Cada producto se muestra en la lista
   ✅ No se pueden agregar productos duplicados
   ✅ Total suma todos los subtotales
```

### Información Adicional
```bash
1. Scroll hasta "Información Adicional"
2. Fecha de Entrega (opcional):
   - Click en el campo
   - Seleccionar una fecha
   ✅ Fecha se guarda

3. Notas del Pedido (opcional):
   - Escribir notas (ej: "Entregar por la mañana")
   ✅ Texto se guarda
```

### Sidebar Resumen (Desktop)
```bash
En pantallas grandes, el sidebar derecho muestra:
✅ Cliente seleccionado
✅ Cantidad de productos
✅ Estado: "Pendiente" (badge amarillo)
✅ TOTAL en grande
✅ Botón "Crear Pedido"
✅ Botón "Cancelar"
```

### Mobile Layout
```bash
1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Seleccionar iPhone o Android
4. Verificar:
   ✅ Formulario ocupa todo el ancho
   ✅ Sidebar aparece ABAJO del formulario
   ✅ Botones son touch-friendly (grandes)
   ✅ Popovers se adaptan a pantalla pequeña
   ✅ No hay zoom al tocar inputs
```

### Validaciones
```bash
1. Intentar crear pedido SIN cliente:
   ✅ Toast error: "Debes seleccionar un cliente"

2. Intentar crear pedido SIN productos:
   ✅ Toast error: "Debes agregar al menos un producto"

3. Intentar crear pedido con precio 0:
   ✅ Toast error: "Todos los productos deben tener un precio mayor a 0"
```

### Crear Pedido Exitoso
```bash
1. Seleccionar cliente
2. Agregar 2-3 productos
3. Poner precios a cada producto
4. (Opcional) Agregar fecha de entrega
5. (Opcional) Agregar notas
6. Click "Crear Pedido"
7. Verificar:
   ✅ Toast verde: "Pedido PED-XXXXXX-XXXX creado exitosamente"
   ✅ Redirección a /admin
   ✅ Pedido aparece en la lista
```

---

## 3. 📄 Verificar PDF Mejorado

### Generar PDF
```bash
1. Ir a /admin
2. Click "Ver detalles" en cualquier pedido
3. Scroll hasta abajo
4. Click en "Descargar PDF"
5. Se descarga archivo: presupuesto-PED-XXX.pdf
```

### Verificar Diseño Profesional
```bash
Abrir el PDF y verificar:

1. HEADER:
   ✅ Fondo gris claro
   ✅ "LA ORIGINAL" en negro grande y bold
   ✅ "Distribuidora de Bebidas" en gris
   ✅ Título "PRESUPUESTO" a la derecha
   ✅ Número de pedido
   ✅ Fecha de creación
   ✅ Fecha de entrega (si tiene)

2. INFORMACIÓN DEL CLIENTE:
   ✅ Box con borde gris y fondo claro
   ✅ Título "INFORMACIÓN DEL CLIENTE" en bold
   ✅ Nombre del cliente
   ✅ Teléfono
   ✅ Email (si tiene)

3. TABLA DE PRODUCTOS:
   ✅ Header negro (no azul como antes)
   ✅ 5 columnas:
      - Producto
      - Descripción ⭐ NUEVA COLUMNA
      - Cant.
      - Precio Unit.
      - Subtotal
   ✅ Descripción en letra pequeña gris
   ✅ Productos con fondo alternado (striped)

4. NOTAS (si tiene):
   ✅ Box amarillo claro a la izquierda
   ✅ Título "NOTAS DEL PEDIDO"
   ✅ Texto de las notas

5. TOTALES:
   ✅ Box gris a la derecha
   ✅ "Subtotal:" con monto
   ✅ "TOTAL:" en grande y bold

6. FOOTER:
   ✅ Línea divisoria negra
   ✅ "Gracias por su confianza"
   ✅ "LA ORIGINAL - Distribuidora de Bebidas" en bold
   ✅ Email de contacto
```

### Comparar con PDF Anterior
```bash
ANTES:
- Header azul simple
- Sin box de cliente
- Tabla con 4 columnas (sin descripción)
- Sin box de notas
- Footer básico

AHORA:
✅ Header gris profesional
✅ Box de cliente con bordes
✅ Tabla con 5 columnas (incluye descripción)
✅ Box amarillo para notas
✅ Boxes para totales
✅ Footer con línea divisoria
```

---

## 4. 🎨 Verificar Logo en Todos Lados

### Favicon
```bash
1. Abrir la app en el navegador
2. Mirar el ícono de la pestaña
3. Verificar:
   ✅ Logo de "La Original" visible
   ✅ No es solo texto o letra
```

### Open Graph (Compartir)
```bash
1. Deploy la app (o usar ngrok para localhost)
2. Copiar URL de la app
3. Pegar en WhatsApp o Facebook
4. Verificar preview:
   ✅ Aparece logo de "La Original"
   ✅ Título: "La Original - Distribuidora de Bebidas"
   ✅ Descripción: "Tu distribuidora de confianza"
```

### PWA Install (Mobile)
```bash
1. Deploy la app a producción
2. Abrir en Chrome móvil
3. Menú (3 puntos) → "Agregar a pantalla de inicio"
4. Click "Agregar"
5. Verificar:
   ✅ Ícono en home screen con logo de "La Original"
   ✅ Nombre: "La Original"
   ✅ Al abrir, se ve como app nativa
   ✅ Sin barra de navegador
```

### PWA Install (Desktop)
```bash
1. Abrir app en Chrome desktop
2. Buscar ícono de instalación en la barra de URL
3. Click en ícono de instalación
4. Click "Instalar"
5. Verificar:
   ✅ App se abre en ventana separada
   ✅ Ícono en barra de tareas
   ✅ Sin barra de navegador
```

---

## 5. 📱 Verificar Responsive

### Mobile (< 768px)
```bash
1. F12 → Device Toolbar
2. Seleccionar iPhone 12 Pro
3. Navegar por la app
4. Verificar en /admin/crear-pedido:
   ✅ Formulario full-width
   ✅ Sidebar abajo (no al lado)
   ✅ Botones grandes y touch-friendly
   ✅ Popovers se abren correctamente
   ✅ No hay zoom al tocar inputs

5. Tocar varios inputs:
   ✅ Input de cliente
   ✅ Input de búsqueda de producto
   ✅ Input de cantidad
   ✅ Input de precio
   ✅ Input de fecha
   ✅ Textarea de notas

6. Verificar que NINGUNO hace zoom automático
```

### Tablet (768px - 1024px)
```bash
1. Cambiar a iPad
2. Verificar /admin/crear-pedido:
   ✅ Layout intermedio
   ✅ Algún espacio adicional
   ✅ Botones con buen tamaño
```

### Desktop (> 1024px)
```bash
1. Volver a desktop view
2. Verificar /admin/crear-pedido:
   ✅ 2 columnas (formulario + sidebar)
   ✅ Sidebar sticky (se queda arriba al scroll)
   ✅ Espaciado apropiado
```

---

## 6. 🧪 Test Completo End-to-End

### Flujo Completo de Pedido
```bash
1. Login como admin
   URL: http://localhost:3000/login

2. Ir a Gestionar Clientes
   /admin/clientes

3. Crear un cliente nuevo (si no hay):
   - Nombre: "Juan Pérez"
   - Teléfono: "123-456-789"
   - Email: "juan@example.com"
   - Ciudad: "Buenos Aires"
   - Dirección: "Calle Falsa 123"
   ✅ Cliente creado

4. Ir a Crear Pedido:
   /admin/crear-pedido

5. Seleccionar cliente "Juan Pérez"
   ✅ Cliente seleccionado
   ✅ Info del cliente visible

6. Agregar productos:
   - Producto 1: Coca Cola 2.25L
     - Cantidad: 10
     - Precio: $150.00
     - Subtotal: $1500.00

   - Producto 2: Pepsi 2.25L
     - Cantidad: 5
     - Precio: $140.00
     - Subtotal: $700.00

   - Producto 3: Sprite 2.25L
     - Cantidad: 8
     - Precio: $145.00
     - Subtotal: $1160.00

7. Agregar fecha de entrega:
   - Seleccionar mañana
   ✅ Fecha guardada

8. Agregar notas:
   - "Entregar por la mañana antes de las 10am"
   ✅ Notas guardadas

9. Verificar resumen:
   ✅ Cliente: Juan Pérez
   ✅ Productos: 3
   ✅ Total: $3360.00

10. Crear pedido:
    Click "Crear Pedido"
    ✅ Toast: "Pedido PED-XXX creado exitosamente"
    ✅ Redirección a /admin

11. Verificar pedido en lista:
    ✅ Aparece el nuevo pedido
    ✅ Cliente: Juan Pérez
    ✅ Estado: Pendiente (badge amarillo)
    ✅ Items: 3

12. Ver detalles del pedido:
    Click "Ver detalles"
    ✅ Se ve toda la información
    ✅ Cliente correcto
    ✅ 3 productos con precios correctos
    ✅ Fecha de entrega visible
    ✅ Notas visibles

13. Descargar PDF:
    Click "Descargar PDF"
    ✅ PDF se descarga

14. Abrir PDF y verificar:
    ✅ Header profesional
    ✅ Info cliente en box
    ✅ 3 productos en tabla
    ✅ Columna descripción visible
    ✅ Fecha de entrega mostrada
    ✅ Notas en box amarillo
    ✅ Total correcto: $3360.00
    ✅ Footer profesional
```

---

## 7. ✅ Checklist Final

Marcar cada item después de probarlo:

### Logo
- [ ] Logo en header (desktop)
- [ ] Logo en header (mobile)
- [ ] Logo en footer (desktop)
- [ ] Logo en footer (mobile)
- [ ] Favicon en pestaña
- [ ] PWA icon (si está deployado)
- [ ] Apple touch icon (iOS)

### Crear Pedido
- [ ] Botón "Crear Pedido" visible en /admin
- [ ] Botón tiene gradiente azul
- [ ] Click abre /admin/crear-pedido
- [ ] Selector de cliente funciona
- [ ] Búsqueda de cliente funciona
- [ ] Info de cliente se muestra
- [ ] Selector de producto funciona
- [ ] Búsqueda de producto funciona
- [ ] Se pueden agregar múltiples productos
- [ ] No se pueden agregar duplicados
- [ ] **Input de precio custom funciona** ⭐
- [ ] Input de cantidad funciona
- [ ] Subtotales se calculan correctamente
- [ ] Total se calcula correctamente
- [ ] Fecha de entrega se puede seleccionar
- [ ] Notas se pueden escribir
- [ ] Validación: cliente requerido
- [ ] Validación: productos requeridos
- [ ] Validación: precios > 0
- [ ] Pedido se crea exitosamente
- [ ] Toast de éxito aparece
- [ ] Redirección a /admin funciona
- [ ] Pedido aparece en la lista

### PDF
- [ ] PDF se puede descargar
- [ ] Header tiene fondo gris
- [ ] Box de cliente visible
- [ ] **Columna descripción en tabla** ⭐
- [ ] Fecha de entrega mostrada
- [ ] Notas en box amarillo
- [ ] Totales en box gris
- [ ] Footer con línea divisoria
- [ ] Todos los datos son correctos

### Mobile
- [ ] Layout responsive en /admin/crear-pedido
- [ ] Sidebar abajo en mobile
- [ ] Botones touch-friendly
- [ ] **NO hay zoom en inputs** ⭐
- [ ] Popovers funcionan
- [ ] Stepper es scrollable
- [ ] Todo se ve bien en iPhone
- [ ] Todo se ve bien en Android

---

## 🎉 Si Todo Está ✅

**¡FELICITACIONES!** La aplicación está **100% funcional** y lista para producción.

### Próximo Paso: Deploy

```bash
1. Commit todos los cambios:
   git add .
   git commit -m "feat: crear pedidos admin + logo + PDF mejorado"

2. Push a repositorio:
   git push origin main

3. Deploy (Vercel/Netlify):
   - Conectar repositorio
   - Deploy automático

4. Probar en móvil real:
   - Abrir URL en Chrome móvil
   - Instalar como PWA
   - Verificar todo funciona
```

---

## 🆘 Si Algo No Funciona

### Problemas Comunes

**1. Logo no se ve en header/footer**
```bash
Solución:
- Verificar que existe: public/logo.png
- Hard refresh: Ctrl+F5
- Limpiar cache del navegador
```

**2. Iconos PWA no aparecen**
```bash
Solución:
- Verificar archivos en public/:
  - icon-192.png
  - icon-512.png
  - favicon.png
- Verificar manifest.json tiene los iconos
- Re-deploy la app
```

**3. PDF sin descripción**
```bash
Solución:
- Verificar que el producto tiene descripción en DB
- Verificar lib/pdf.ts usa item.product_description
- Crear nuevo pedido y probar
```

**4. No se puede cambiar precio**
```bash
Solución:
- Verificar que estás en /admin/crear-pedido
- Buscar input con label "Precio Unitario ($)"
- Debe aceptar números decimales
```

**5. Zoom en inputs mobile**
```bash
Solución:
- Verificar app/globals.css tiene:
  input { font-size: 16px !important; }
- Hard refresh en móvil
- Limpiar cache
```

---

**Autor**: Claude
**Fecha**: 2025-10-26
**Versión**: 1.0
**Estado**: ✅ Listo para probar
