// sipur-hozer/frontend/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// public paths (no authentication required)
const PUBLIC_PATHS = ['/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // if the path is public, no need to check auth
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // skip files with extensions
  ) {
    return NextResponse.next();
  }

  // check for session cookie 
  const session = request.cookies.get('mysession');

  // if no session cookie, redirect to home page
  if (!session) {
    // create a redirect response to the home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  // if session exists, allow the request to proceed
  return NextResponse.next();
}

// define which paths the middleware should run on
// (all paths except API, images, and static files)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}