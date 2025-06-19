import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Admin routes - only accessible by ADMIN users
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', req.url))
      }
    }

    // Dashboard routes - accessible by authenticated users
    if (pathname.startsWith('/surveys') || pathname.startsWith('/calendar')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to auth pages
        if (pathname.startsWith('/auth')) {
          return true
        }

        // Allow access to public API routes
        if (pathname.startsWith('/api/auth')) {
          return true
        }

        // Allow access to survey submission pages (public)
        if (pathname.startsWith('/survey/') && !pathname.includes('/results')) {
          return true
        }

        // Require authentication for all other protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ]
}