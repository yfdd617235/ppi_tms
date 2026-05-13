'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { companySchema } from '@/lib/validations/company'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createCompanySchema = companySchema.extend({
  user_email: z.string().email('Email del usuario requerido'),
  user_full_name: z.string().max(200).optional(),
})

const updateCompanySchema = companySchema.extend({
  user_email: z.string().email('Email inválido').optional().or(z.literal('')),
  user_full_name: z.string().max(200).optional(),
  old_user_email: z.string().optional(),
})

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return { error: 'No autorizado', user: null }
  }
  return { error: null, user }
}

async function sendAccessLink(email: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  // REDIRIGIMOS DIRECTAMENTE AL CLIENTE. Si pasamos por la API /api/auth/callback, 
  // el servidor no puede leer el hash (#access_token) que envía Supabase para flujos implícitos.
  const redirectTo = `${appUrl}/establecer-contrasena`
  const serviceClient = createServiceClient()

  // 1. Intentar como invitación (para usuarios nuevos o no confirmados)
  const { error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, { redirectTo })

  if (!inviteError) {
    return { success: true }
  }

  // 2. Si falla porque ya existe, intentar como recuperación (para usuarios confirmados)
  // 2. Si falla porque ya existe, intentar como recuperación (para usuarios confirmados)
  // IMPORTANTE: Creamos un cliente especial SIN PKCE (flowType: 'implicit')
  // para que el enlace generado se pueda abrir en cualquier dispositivo sin requerir cookies.
  // Además, esto usa el SDK oficial, garantizando que el parámetro redirectTo sea respetado.
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const implicitAdminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        flowType: 'implicit'
      }
    }
  )

  const { error: resetError } = await implicitAdminClient.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo
  })

  if (resetError) {
    console.error('Error sending recovery link:', resetError)
    return { error: resetError.message ?? 'Error al enviar enlace de recuperación' }
  }

  return { success: true }
}

export async function createCompany(formData: FormData) {
  const { error: authError } = await assertSuperAdmin()
  if (authError) return { error: authError }

  const raw = {
    razon_social: formData.get('razon_social') as string,
    nit: formData.get('nit') as string,
    direccion: (formData.get('direccion') as string) || undefined,
    correo: formData.get('correo') as string,
    celular: (formData.get('celular') as string) || undefined,
    nombre_representante_legal: (formData.get('nombre_representante_legal') as string) || undefined,
    nombre_contacto_operaciones: (formData.get('nombre_contacto_operaciones') as string) || undefined,
    correo_contacto_operaciones: (formData.get('correo_contacto_operaciones') as string) || undefined,
    telefono_contacto_operaciones: (formData.get('telefono_contacto_operaciones') as string) || undefined,
    user_email: formData.get('user_email') as string,
    user_full_name: (formData.get('user_full_name') as string) || undefined,
  }

  const parsed = createCompanySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos. Revisa el formulario.', fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { user_email, user_full_name, ...companyData } = parsed.data
  const serviceClient = createServiceClient()

  const { data: company, error: companyError } = await serviceClient
    .from('companies')
    .insert(companyData)
    .select('id')
    .single()

  if (companyError) {
    if (companyError.code === '23505') return { error: 'Ya existe una empresa con ese NIT.' }
    return { error: 'Error al crear la empresa. Intenta de nuevo.' }
  }

  // Assign accounts selected during creation (silent failure — can be done later from company detail)
  const cuentasJson = formData.get('cuentas_json') as string | null
  if (cuentasJson) {
    try {
      const cuentas = JSON.parse(cuentasJson) as Array<{ account_id: string; egreso_a_discrecion: boolean }>
      if (cuentas.length > 0) {
        await serviceClient
          .from('company_accounts')
          .insert(cuentas.map(c => ({
            company_id: company.id,
            account_id: c.account_id,
            egreso_a_discrecion: c.egreso_a_discrecion,
          })))
      }
    } catch { /* silently ignore — accounts can be assigned later */ }
  }

  // Invite user via Supabase Admin API
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  const redirectTo = `${appUrl}/establecer-contrasena`
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
    user_email,
    { data: { full_name: user_full_name ?? '' }, redirectTo }
  )

  if (inviteError) {
    revalidatePath('/superadmin/empresas')
    return { warning: `Empresa creada, pero no se pudo enviar la invitación: ${inviteError.message}` }
  }

  if (inviteData?.user) {
    await serviceClient
      .from('profiles')
      .update({ company_id: company.id, full_name: user_full_name ?? null })
      .eq('id', inviteData.user.id)
  }

  revalidatePath('/superadmin/empresas')
  redirect(`/superadmin/empresas/${company.id}`)
}

export async function updateCompany(id: string, formData: FormData) {
  const { error: authError } = await assertSuperAdmin()
  if (authError) return { error: authError }

  const raw = {
    razon_social: formData.get('razon_social') as string,
    nit: formData.get('nit') as string,
    direccion: (formData.get('direccion') as string) || undefined,
    correo: formData.get('correo') as string,
    celular: (formData.get('celular') as string) || undefined,
    nombre_representante_legal: (formData.get('nombre_representante_legal') as string) || undefined,
    nombre_contacto_operaciones: (formData.get('nombre_contacto_operaciones') as string) || undefined,
    correo_contacto_operaciones: (formData.get('correo_contacto_operaciones') as string) || undefined,
    telefono_contacto_operaciones: (formData.get('telefono_contacto_operaciones') as string) || undefined,
    user_email: (formData.get('user_email') as string) || undefined,
    old_user_email: (formData.get('old_user_email') as string) || undefined,
  }

  const parsed = updateCompanySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: 'Datos inválidos. Revisa el formulario.', fieldErrors: parsed.error.flatten().fieldErrors }
  }

  // razon_social y nit son inmutables — se excluyen aunque vengan en el form
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user_email, old_user_email, razon_social: _rs, nit: _nit, user_full_name: _fn, ...companyData } = parsed.data
  const serviceClient = createServiceClient()

  const { error: updateError } = await serviceClient
    .from('companies')
    .update({ ...companyData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    if (updateError.code === '23505') return { error: 'Ya existe una empresa con ese NIT.' }
    return { error: 'Error al actualizar. Intenta de nuevo.' }
  }

  // Handle user email change
  if (user_email && user_email !== old_user_email) {
    if (old_user_email) {
      // Email changed: update existing user's email and resend invite
      const { data: userList } = await serviceClient.auth.admin.listUsers()
      const existingUser = userList?.users.find(u => u.email === old_user_email)
      if (existingUser) {
        await serviceClient.auth.admin.updateUserById(existingUser.id, { email: user_email })
        await serviceClient.from('profiles').update({ email: user_email }).eq('id', existingUser.id)
      }
    } else {
      // No user yet: invite new user
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
      const redirectTo = `${appUrl}/establecer-contrasena`
      const { data: inviteData } = await serviceClient.auth.admin.inviteUserByEmail(
        user_email,
        { redirectTo }
      )
      if (inviteData?.user) {
        await serviceClient.from('profiles')
          .update({ company_id: id })
          .eq('id', inviteData.user.id)
      }
      revalidatePath('/superadmin/empresas')
      redirect('/superadmin/empresas')
    }

    // Send invite email to new address
    await sendAccessLink(user_email)
  }

  revalidatePath('/superadmin/empresas')
  redirect('/superadmin/empresas')
}

export async function resendInvite(companyId: string): Promise<{ error?: string; success?: boolean }> {
  const { error: authError } = await assertSuperAdmin()
  if (authError) return { error: authError }

  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('email')
    .eq('company_id', companyId)
    .eq('role', 'client')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!profile?.email) return { error: 'No hay usuario vinculado a esta empresa.' }

  return sendAccessLink(profile.email)
}

export async function toggleCompanyStatus(id: string, currentActiva: boolean): Promise<void> {
  const { error: authError } = await assertSuperAdmin()
  if (authError) return

  const serviceClient = createServiceClient()
  await serviceClient
    .from('companies')
    .update({ activa: !currentActiva, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/superadmin/empresas')
}
