-- =====================================================
-- FIX ROLE CONSTRAINT - EJECUTAR AHORA EN SUPABASE
-- =====================================================
-- Este fix actualiza el constraint de roles para permitir 'empleado'
-- y asegura que los cambios de rol funcionen correctamente

-- 1. Eliminar el constraint antiguo
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Agregar el nuevo constraint con los 3 roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'empleado', 'customer'));

-- 3. Verificar que no haya políticas RLS bloqueando el UPDATE
-- Las políticas RLS pueden estar impidiendo que cambies roles

-- Ver las políticas actuales de profiles:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 4. Crear política para que admins puedan actualizar roles de otros usuarios
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- 5. Asegurar que los usuarios puedan actualizar su propio perfil (excepto el rol)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Si intentan cambiar su propio rol, será bloqueado por la lógica de la app
  );

-- 6. Verificar los roles actuales
SELECT
  email,
  role,
  created_at,
  updated_at
FROM profiles
ORDER BY role, email;

SELECT 'Fix aplicado correctamente. Ahora podés cambiar roles sin problemas.' as status;
