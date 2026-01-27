// sipur-hozer/frontend/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // בארכיטקטורת ענן עם דומיינים נפרדים, ה-Middleware לא יכול לקרוא את ה-Cookie של השרת.
  // לכן, אנחנו מבטלים כאן את החסימה וסומכים על ה-AuthGuard (Client Side) שיבצע את ההגנה.
  
  return NextResponse.next();
}

// אנחנו עדיין יכולים להשאיר את ה-matcher כדי לא להריץ את ה-middleware על קבצים סטטיים
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}