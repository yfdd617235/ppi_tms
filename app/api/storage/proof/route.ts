import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const bucket = searchParams.get('bucket') ?? 'payment-proofs'

  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await authClient
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Clientes solo pueden acceder a archivos de su propia empresa en payment-proofs.
  // Path format: {company_id}/{timestamp}-archivo.ext
  // Para payment-evidence los paths son UUIDs no predecibles, accesibles solo via RLS.
  if (profile.role === 'client' && bucket === 'payment-proofs') {
    if (!profile.company_id || !path.startsWith(`${profile.company_id}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600)

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate URL' }, { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
