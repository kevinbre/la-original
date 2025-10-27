# 🗄️ Instrucciones para Ejecutar Migraciones SQL

## ⚠️ IMPORTANTE: Ejecutar en ORDEN

Las migraciones deben ejecutarse en este orden específico:

1. `migration-company-settings.sql` ← Primero
2. `migration-update-order-statuses.sql` ← Segundo
3. `migration-fixes-complete.sql` ← Tercero

---

## 📝 Opción 1: Desde Supabase Dashboard (Recomendado)

### Paso a Paso:

1. **Abrir Supabase Dashboard**
   - Ir a https://app.supabase.com
   - Seleccionar tu proyecto

2. **Ir a SQL Editor**
   - En el menú lateral: SQL Editor
   - Click en "New Query"

3. **Ejecutar Primera Migración**
   ```sql
   -- Copiar TODO el contenido de: migration-company-settings.sql
   -- Pegar acá
   -- Click en "Run" (o Ctrl+Enter)
   ```
   ✅ Verificar que dice "Success"

4. **Ejecutar Segunda Migración**
   ```sql
   -- Nueva Query
   -- Copiar TODO el contenido de: migration-update-order-statuses.sql
   -- Pegar acá
   -- Click en "Run"
   ```
   ✅ Verificar que dice "Success"

5. **Ejecutar Tercera Migración**
   ```sql
   -- Nueva Query
   -- Copiar TODO el contenido de: migration-fixes-complete.sql
   -- Pegar acá
   -- Click en "Run"
   ```
   ✅ Verificar que dice "Success"

---

## 🖥️ Opción 2: Desde Terminal (Avanzado)

Si tenés `psql` instalado:

```bash
# 1. Obtener la connection string de Supabase
# Settings > Database > Connection String > URI

# 2. Conectar
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# 3. Ejecutar migraciones
\i migration-company-settings.sql
\i migration-update-order-statuses.sql
\i migration-fixes-complete.sql
```

---

## 🔍 Verificar que Todo Funcionó

Después de ejecutar las 3 migraciones, correr esta query para verificar:

```sql
-- Verificar que las nuevas columnas existen
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'price_lists' AND column_name = 'color';
-- Debe retornar: color | character varying

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'company_settings' AND column_name = 'whatsapp_number';
-- Debe retornar: whatsapp_number | character varying

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'product_prices' AND column_name = 'is_active';
-- Debe retornar: is_active | boolean

-- Verificar que las columnas obsoletas fueron eliminadas
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name IN ('quote_rejected_at', 'quote_confirmed_at');
-- NO debe retornar nada (debe estar vacío)

-- Verificar el constraint de estados actualizado
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'orders' AND constraint_name = 'orders_status_check';
-- Debe retornar: orders_status_check
```

---

## ❌ Posibles Errores y Soluciones

### Error: "column already exists"
**Causa**: Ya ejecutaste esta migración antes
**Solución**: Está bien, seguí con la siguiente

### Error: "constraint does not exist"
**Causa**: La constraint ya fue eliminada o nunca existió
**Solución**: Está bien, seguí adelante

### Error: "permission denied"
**Causa**: No tenés permisos de administrador
**Solución**: Ejecutar desde Supabase Dashboard (tiene permisos de super admin)

### Error: "column does not exist" al DROP COLUMN
**Causa**: La columna no existe (está bien)
**Solución**: El `IF EXISTS` previene el error, seguí adelante

---

## 📋 Qué Hace Cada Migración

### 1. `migration-company-settings.sql`
- Crea tabla `company_settings` si no existe
- Inserta configuración inicial
- Agrega logo y datos de contacto

### 2. `migration-update-order-statuses.sql`
- Cambia sistema de estados de 9 a 5
- Actualiza pedidos existentes al nuevo sistema
- Elimina estados obsoletos
- Actualiza constraint de estados

### 3. `migration-fixes-complete.sql`
- Agrega columna `color` a `price_lists`
- Elimina columnas obsoletas de `orders`
- Agrega columna `is_active` a `product_prices`
- Agrega configuración de WhatsApp

---

## 🎯 Resultado Final

Después de ejecutar las 3 migraciones tendrás:

### Tablas Actualizadas:
- ✅ `orders` → sin columnas obsoletas, con nuevos estados
- ✅ `price_lists` → con columna `color`
- ✅ `product_prices` → con columna `is_active`
- ✅ `company_settings` → con config de WhatsApp

### Constraints Actualizados:
- ✅ `orders_status_check` → solo 5 estados válidos

### Datos Migrados:
- ✅ Pedidos con estados viejos → convertidos a nuevos estados
- ✅ Sin pérdida de datos
- ✅ Sin romper relaciones (foreign keys)

---

## 🚀 Siguiente Paso

Una vez ejecutadas las 3 migraciones:

1. ✅ Hacer hard refresh en la app (Ctrl+Shift+R)
2. ✅ Verificar que no hay errores en la consola
3. ✅ Seguir el checklist de testing: `CHECKLIST-TESTING.md`

---

## 💾 Backup (Recomendado)

Antes de ejecutar las migraciones, hacer backup desde Supabase:

1. Dashboard > Database > Backups
2. Click en "Backup now"
3. Esperar a que complete
4. Ahora sí, ejecutar las migraciones

Si algo sale mal, podés restaurar desde el backup.

---

**Nota**: Estas migraciones son seguras y usan `IF EXISTS` / `IF NOT EXISTS` para prevenir errores. Podés ejecutarlas múltiples veces sin romper nada.
