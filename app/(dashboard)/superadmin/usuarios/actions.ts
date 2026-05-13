'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
}) {
  try {
    await assertSuperAdmin()
    const supabaseService = createServiceClient()

    const { data: targetProfile } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    const currentRole = targetProfile?.role
    const newRole = data.role
    const isStaff = (r: string) => r === 'admin' || r === 'super_admin'

    if (currentRole === 'client' && isStaff(newRole)) {
      return { error: 'Un cliente no puede ser promovido a rol de staff.' }
    }
    if (isStaff(currentRole ?? '') && newRole === 'client') {
      return { error: 'Un miembro de staff no puede ser convertido a cliente.' }
    }

    // 1. Actualizar perfil en DB (company_id es inmutable desde aquí)
    const { error: profileError } = await supabaseService
      .from('profiles')
      .update({
        full_name: data.full_name,
        role: data.role,
      })
      .eq('id', userId)

    if (profileError) return { error: 'Error al actualizar el usuario. Intenta de nuevo.' }

    // 2. Actualizar metadatos en Auth
    await supabaseService.auth.admin.updateUserById(userId, {
      user_metadata: {
        role: data.role,
        full_name: data.full_name,
      }
    })

    revalidatePath('/superadmin/usuarios')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function inviteStaffUser(data: {
  email: string
  full_name: string
  role: 'admin' | 'super_admin'
}) {
  try {
    await assertSuperAdmin()
    const serviceClient = createServiceClient()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
    const redirectTo = `${appUrl}/establecer-contrasena`

    const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
      data.email,
      {
        redirectTo,
        data: { role: data.role, full_name: data.full_name },
      }
    )

    if (inviteError) return { error: inviteError.message }

    // El trigger handle_new_user crea el perfil con el rol del metadata.
    // Actualizamos full_name y confirmamos company_id = null (staff de PPI).
    if (inviteData?.user) {
      await serviceClient
        .from('profiles')
        .update({ full_name: data.full_name, company_id: null })
        .eq('id', inviteData.user.id)
    }

    revalidatePath('/superadmin/usuarios')
    redirect('/superadmin/usuarios')
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error
    return { error: error.message }
  }
}

export async function deleteUser(userId: string) {
  try {
    const { user: currentUser } = await assertSuperAdmin()

    if (currentUser.id === userId) {
      return { error: 'No puedes eliminar tu propia cuenta.' }
    }

    const supabaseService = createServiceClient()

    const { data: targetProfile } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (targetProfile?.role === 'super_admin') {
      return { error: 'Los Super Admins no pueden eliminarse desde la plataforma. Hazlo directamente desde el panel de Supabase.' }
    }

    const { error } = await supabaseService.auth.admin.deleteUser(userId)
    if (error) return { error: 'Error al eliminar el usuario. Intenta de nuevo.' }

    revalidatePath('/superadmin/usuarios')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
