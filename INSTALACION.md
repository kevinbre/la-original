# 🚀 Guía de Instalación Rápida - LA ORIGINAL

## Pasos para poner la app en funcionamiento

### 1️⃣ Configurar Supabase (5 minutos)

1. Ve a https://supabase.com y crea una cuenta gratis
2. Crea un nuevo proyecto:
   - Nombre: `la-original`
   - Password: guarda esta contraseña (la necesitarás)
   - Región: South America (São Paulo) - la más cercana a Argentina
3. Espera 2 minutos a que se cree el proyecto
4. Ve a **SQL Editor** (ícono de base de datos en el menú izquierdo)
5. Click en **+ New Query**
6. Copia TODO el contenido del archivo `supabase-schema.sql`
7. Pégalo en el editor y click en **Run**
8. Deberías ver "Success. No rows returned"

### 2️⃣ Obtener las Credenciales

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) > **API**
2. Copia estos dos valores:
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   ```
3. ¡Guárdalos! Los necesitas en el siguiente paso

### 3️⃣ Instalar la App Localmente

```bash
# En la terminal, dentro de la carpeta la-original:

# 1. Instalar dependencias (toma 1-2 minutos)
npm install

# 2. Crear archivo de configuración
cp .env.example .env.local

# 3. Editar .env.local con tus credenciales
# Abre .env.local con cualquier editor de texto y reemplaza:
# - NEXT_PUBLIC_SUPABASE_URL con tu Project URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY con tu anon/public key
# - NEXT_PUBLIC_WHATSAPP_NUMBER con tu número de WhatsApp (formato: 5493414123456)

# 4. Iniciar la app
npm run dev
```

### 4️⃣ Probar la App

1. Abre tu navegador en http://localhost:3000
2. Deberías ver la página de inicio de LA ORIGINAL
3. Click en "Registrarse" y crea tu cuenta
4. Ya puedes navegar los productos y hacer un pedido de prueba

### 5️⃣ Convertirte en Admin

Para acceder al panel de administración:

1. Ve a https://app.supabase.com
2. Abre tu proyecto
3. Click en **Table Editor** (ícono de tabla)
4. Selecciona la tabla `profiles`
5. Busca tu usuario (verás tu email)
6. Haz doble click en la columna `role`
7. Cambia `customer` por `admin`
8. Click en el ✓ para guardar
9. Refresca la app en tu navegador
10. ¡Ahora verás el menú "Admin"!

### 6️⃣ Deploy Gratuito en Vercel (Opcional)

Para que la app esté online 24/7 gratis:

1. Sube tu código a GitHub:
   ```bash
   # Inicializar git
   git init
   git add .
   git commit -m "Primera versión de La Original"
   
   # Crear repo en GitHub y seguir las instrucciones para subir el código
   ```

2. Ve a https://vercel.com
3. Click en "Sign up" con tu cuenta de GitHub
4. Click en "New Project"
5. Importa tu repositorio de GitHub
6. En "Environment Variables" agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
   - `NEXT_PUBLIC_APP_URL` = (lo dejas vacío por ahora)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = tu número
7. Click en "Deploy"
8. Espera 2-3 minutos
9. ¡Listo! Te dará una URL tipo https://la-original.vercel.app

### 7️⃣ Actualizar la URL de la App

1. Copia la URL que te dio Vercel
2. Ve a Vercel > Settings > Environment Variables
3. Edita `NEXT_PUBLIC_APP_URL` y ponle la URL completa
4. Redeploy la app (Settings > Deployments > ... > Redeploy)

## ✅ Checklist de Verificación

Antes de usar en producción, verifica que:

- [ ] Puedes registrarte y login
- [ ] Puedes ver productos
- [ ] Puedes agregar productos al carrito
- [ ] Puedes crear un pedido
- [ ] Como admin, puedes ver todos los pedidos
- [ ] Como admin, puedes cambiar estados de pedidos
- [ ] Puedes generar un PDF de presupuesto
- [ ] El link de WhatsApp funciona correctamente

## 🆘 ¿Problemas?

### "Cannot connect to Supabase"
- Verifica que las variables de entorno estén correctas
- Asegúrate de reiniciar el servidor después de editar .env.local

### "Failed to fetch products"
- Verifica que ejecutaste el SQL schema completo
- Ve a Supabase > Table Editor y confirma que existen las tablas

### No puedo hacer pedidos
- Verifica que las funciones SQL estén creadas
- En Supabase, ve a Database > Functions
- Deberías ver: generate_order_number, generate_invoice_number, generate_guest_token

### No veo el panel Admin
- Asegúrate de cambiar tu role a 'admin' en la tabla profiles
- Cierra sesión y vuelve a iniciar sesión

## 📞 Contacto

Si tienes dudas sobre la instalación, revisa:
- README.md - Documentación completa
- Supabase Docs - https://supabase.com/docs
- Next.js Docs - https://nextjs.org/docs

---

¡Éxito con La Original! 🥤
