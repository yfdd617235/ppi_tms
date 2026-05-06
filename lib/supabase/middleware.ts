import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isLoginRoute = url.pathname === '/login'
  const isSuperAdminRoute = url.pathname.startsWith('/superadmin')
  const isAdminRoute = url.pathname.startsWith('/admin')
  const isClientRoute = url.pathname.startsWith('/cliente')
  const isProtectedRoute = isSuperAdminRoute || isAdminRoute || isClientRoute

  if (!user && isProtectedRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginRoute) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Role-based route enforcement
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (isSuperAdminRoute && role !== 'super_admin') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    if (isAdminRoute && role !== 'admin' && role !== 'super_admin') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    if (isClientRoute && role !== 'client' && role !== 'super_admin') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
