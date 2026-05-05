'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') throw new Error('No autorizado')
  return { user }
}

export async function updateUser(userId: string, data: {
  full_name: string
  role: string
  company_id: string | null
}) {
  try {
    await assertSuperAdmin()
    const supabaseService = createServiceClient()

    // 1. Actualizar perfil en DB
    const { error: profileError } = await supabaseService
      .from('profiles')
      .update({
        full_name: data.full_name,
        role: data.role,
        company_id: data.company_id
      })
      .eq('id', userId)

    if (profileError) return { error: profileError.message }

    // 2. Actualizar metadatos en Auth
    await supabaseService.auth.admin.updateUserById(userId, {
      user_metadata: {
        role: data.role,
        full_name: data.full_name,
        company_id: data.company_id
      }
    })

    revalidatePath('/superadmin/usuarios')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function deleteUser(userId: string) {
  try {
    const { user: currentUser } = await assertSuperAdmin()

    // Prevenir auto-eliminación
    if (currentUser.id === userId) {
      return { error: 'No puedes eliminar tu propia cuenta.' }
    }

    const supabaseService = createServiceClient()

    const { error } = await supabaseService.auth.admin.deleteUser(userId)
    if (error) return { error: error.message }

    revalidatePath('/superadmin/usuarios')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
