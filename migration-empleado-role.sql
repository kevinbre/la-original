-- Migration: Add 'empleado' role
-- Date: 2025-10-27

-- Esta migración agrega el rol 'empleado' al sistema
-- Los empleados pueden:
-- - Crear y gestionar pedidos
-- - Gestionar productos
-- - Gestionar precios
-- - Gestionar clientes
--
-- Los empleados NO pueden:
-- - Configurar empresa (company_settings)
-- - Configurar WhatsApp
-- - Gestionar usuarios (cambiar roles)

-- Nota: En PostgreSQL con Supabase, los ENUM types no se pueden modificar directamente
-- Si estás usando un CHECK constraint en lugar de ENUM, puedes ejecutar esto:

-- Opción 1: Si usas CHECK constraint (recomendado):
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'empleado', 'customer'));

-- Opción 2: Si usas ENUM type, necesitarás recrear el type:
-- IMPORTANTE: Esto requiere que no haya valores en uso
-- DROP TYPE IF EXISTS user_role CASCADE;
-- CREATE TYPE user_role AS ENUM ('admin', 'empleado', 'customer');
-- ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Por defecto, los nuevos usuarios son 'customer'
-- Para convertir un usuario en empleado, ejecuta:
-- UPDATE profiles SET role = 'empleado' WHERE email = 'email@ejemplo.com';

-- Para verificar los roles actuales:
-- SELECT email, role FROM profiles ORDER BY role, email;

SELECT 'Migration completed: empleado role added' as status;
