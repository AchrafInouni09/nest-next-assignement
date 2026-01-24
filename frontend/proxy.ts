// ...existing code...
import { NextResponse } from 'next/server'
import cookie from 'cookie'

export async function proxy(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Public/asset/API paths — don't enforce auth to avoid redirect loops
  if (
    pathname === '/' ||
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  const cookies = cookie.parse(request.headers.get('cookie') || '')
  if (!cookies.session) return NextResponse.redirect(new URL('/signin', request.url))
  return NextResponse.next()
}
// ...existing code...