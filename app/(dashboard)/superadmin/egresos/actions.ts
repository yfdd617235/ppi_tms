'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function assertSuperAdmin() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await authClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') return { error: 'No autorizado', user: null }
  return { error: null, user }
}

export async function executeExpenseRequest(formData: FormData) {
  // 1. Verificar sesión y rol
  const { error: authError, user } = await assertSuperAdmin()
  if (authError || !user) return { error: authError ?? 'No autorizado' }

  const id = formData.get('id') as string
  const evidenceFile = formData.get('evidencia') as File | null
  const notas = formData.get('notas_admin') as string

  if (!id || !evidenceFile || evidenceFile.size === 0) {
    return { error: 'El soporte de pago es obligatorio.' }
  }
  if (evidenceFile.size > 10 * 1024 * 1024) {
    return { error: 'El archivo no puede superar los 10 MB.' }
  }

  const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED_MIME_TYPES.includes(evidenceFile.type)) {
    return { error: 'Solo se permiten archivos PDF, JPG o PNG.' }
  }

  // 2. Operaciones con el cliente de servicio (Service Role)
  const supabase = createServiceClient()
  
  const ext = evidenceFile.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('payment-evidence')
    .upload(path, evidenceFile, {
      contentType: evidenceFile.type,
      upsert: false
    })

  if (uploadError) {
    console.error('Error uploading evidence:', uploadError)
    return { error: 'Error al subir el archivo de evidencia.' }
  }

  const { error } = await supabase
    .from('expense_requests')
    .update({
      estado: 'ejecutado',
      ejecutado_por: user.id,
      ejecutado_at: new Date().toISOString(),
      evidencia_url: path,
      evidencia_nombre: evidenceFile.name,
      notas_admin: notas || null
    })
    .eq('id', id)

  if (error) {
    console.error('Error executing expense:', error)
    return { error: 'Error al registrar el pago en la base de datos.' }
  }

  revalidatePath('/superadmin/egresos')
  return { success: true }
}

export async function emitirCheque(formData: FormData) {
  const { error: authError, user } = await assertSuperAdmin()
  if (authError || !user) return { error: authError ?? 'No autorizado' }

  const id = formData.get('id') as string
  const chequeFile = formData.get('cheque') as File | null
  const notas = formData.get('notas_admin') as string

  if (!id || !chequeFile || chequeFile.size === 0) {
    return { error: 'El scan del cheque es obligatorio.' }
  }
  if (chequeFile.size > 10 * 1024 * 1024) {
    return { error: 'El archivo no puede superar los 10 MB.' }
  }

  const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED_MIME_TYPES.includes(chequeFile.type)) {
    return { error: 'Solo se permiten archivos PDF, JPG o PNG.' }
  }

  const supabase = createServiceClient()

  const ext = chequeFile.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('payment-evidence')
    .upload(path, chequeFile, {
      contentType: chequeFile.type,
      upsert: false
    })

  if (uploadError) {
    console.error('Error uploading cheque scan:', uploadError)
    return { error: 'Error al subir el archivo del cheque.' }
  }

  const { error } = await supabase
    .from('expense_requests')
    .update({
      estado: 'cheque_emitido',
      cheque_url: path,
      cheque_nombre: chequeFile.name,
      cheque_emitido_por: user.id,
      cheque_emitido_at: new Date().toISOString(),
      notas_admin: notas || null
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating cheque state:', error)
    return { error: 'Error al registrar la emisión del cheque.' }
  }

  revalidatePath('/superadmin/egresos')
  return { success: true }
}

export async function rejectExpenseRequest(id: string, nota: string) {
  // 1. Verificar sesión y rol
  const { error: authError } = await assertSuperAdmin()
  if (authError) return { error: authError }

  if (!nota) return { error: 'La nota de rechazo es obligatoria.' }

  // 2. Ejecutar con service role
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('expense_requests')
    .update({
      estado: 'rechazado',
      notas_admin: nota,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error rejecting expense:', error)
    return { error: 'Error al rechazar la solicitud.' }
  }

  revalidatePath('/superadmin/egresos')
  return { success: true }
}
