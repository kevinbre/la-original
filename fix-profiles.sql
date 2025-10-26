-- =====================================================
-- SCRIPT PARA CORREGIR PROFILES
-- =====================================================
-- Ejecuta este script en el SQL Editor de Supabase

-- Paso 1: Crear la función y trigger si no existen
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Paso 2: Migrar usuarios existentes que no tienen perfil
INSERT INTO public.profiles (id, email, full_name, phone, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  'customer'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Paso 3: Confirmar todos los emails automáticamente (para desarrollo)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Paso 4: Verificar cuántos perfiles se crearon
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Paso 5 (OPCIONAL): Convertir el primer usuario en admin
-- Descomenta y ejecuta SOLO si quieres convertir tu usuario en admin
-- Reemplaza 'tu-email@ejemplo.com' con tu email real

-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'tu-email@ejemplo.com';

-- Verificar que el admin se creó correctamente
-- SELECT email, role FROM public.profiles WHERE role = 'admin';
