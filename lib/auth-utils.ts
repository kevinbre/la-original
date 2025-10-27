import { supabase } from './supabase'

export async function checkIsAdmin(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  return profileData?.role === 'admin'
}

export async function checkIsAdminOrEmpleado(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  return profileData?.role === 'admin' || profileData?.role === 'empleado'
}

export async function getUserRole(): Promise<'admin' | 'empleado' | 'customer' | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  return profileData?.role || null
}
