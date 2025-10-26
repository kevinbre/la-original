# 🚀 INSTRUCCIONES COMPLETAS - LA ORIGINAL

## ✅ PASO 1: EJECUTAR MIGRACIÓN EN SUPABASE (CRÍTICO)

Ve a https://supabase.com/dashboard → Tu Proyecto → SQL Editor

Copia y pega **TODO** el contenido del archivo `EJECUTAR-ESTA-MIGRACION.sql`

Esta migración incluye:
- ✅ Columna `delivery_date` en orders
- ✅ Políticas RLS para usuarios anónimos
- ✅ Tabla `customers` para gestionar clientes
- ✅ Columna `customer_id` en orders
- ✅ Función `generate_order_number` arreglada (sin duplicados)
- ✅ Columna `product_description` en order_items

## ✅ PASO 2: CREAR ICONOS PARA PWA

Crea 2 imágenes con tu logo:
1. `public/icon-192.png` (192x192px)
2. `public/icon-512.png` (512x512px)

Puedes usar: https://realfavicongenerator.net/

## ✅ CAMBIOS COMPLETADOS

### 1. PWA Configurada
- ✅ Manifest.json creado
- ✅ Meta tags para PWA en layout
- ✅ Configuración Apple Web App

### 2. Mobile Optimizado
- ✅ **Zoom arreglado**: Todos los inputs tienen font-size 16px
- ✅ **Stepper mobile-friendly**:
  - Scrollable horizontalmente
  - Labels cortos en mobile
  - Muestra estado actual debajo
  - Círculos más pequeños
- ✅ **Touch targets mínimos**: 44px en mobile

### 3. Base de Datos
- ✅ Tabla `customers` creada
- ✅ Función `generate_order_number` con LOCK para evitar duplicados
- ✅ Columna `product_description` para PDFs

## 📋 TAREAS PENDIENTES (Para próxima sesión)

1. **Página de Gestión de Clientes** (`/admin/clientes`)
   - CRUD completo de clientes
   - Filtros y búsqueda
   - Vista de pedidos por cliente

2. **Modificar Creación de Pedidos Admin**
   - Selector de cliente
   - Cambiar precios por producto
   - Estados simplificados: pendiente → presupuestado → confirmado

3. **Mejorar PDF**
   - Logo de la empresa
   - Descripción de productos
   - Datos de cliente completos
   - Diseño más profesional
   - Footer con términos y condiciones

4. **Optimizaciones Mobile Adicionales**
   - Mejorar tablas en mobile (hacer scrollables)
   - Botones más grandes en mobile
   - Formularios más espaciados

## 🔧 PROBLEMAS CONOCIDOS RESUELTOS

- ✅ Zoom en inputs mobile
- ✅ Order number duplicado
- ✅ RLS para usuarios anónimos
- ✅ Stepper rompiendo layout en mobile
- ✅ PWA no instalable

## 📱 PROBAR EN MÓVIL

1. Ejecuta la migración SQL
2. Crea los iconos PWA
3. Despliega la app
4. Abre en Chrome móvil
5. Menú → "Agregar a inicio"
6. Prueba crear un pedido sin zoom

## 🎨 PRÓXIMAS MEJORAS SUGERIDAS

- [ ] Notificaciones push cuando cambia el estado del pedido
- [ ] Modo offline con service worker
- [ ] Caché de productos para carga rápida
- [ ] Búsqueda de productos más rápida
- [ ] Filtros avanzados en pedidos
- [ ] Exportar lista de clientes a Excel
- [ ] Dashboard con estadísticas para admin

## 📞 SOPORTE

Si algo no funciona:
1. Verifica que ejecutaste la migración SQL completa
2. Revisa la consola del navegador (F12)
3. Verifica que los iconos PWA existan en public/
4. Limpia caché y recarga (Ctrl+Shift+R)

---
**Creado con ❤️ por Claude**
