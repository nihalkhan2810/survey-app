import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req: any) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Admin routes - only accessible by ADMIN users
    if (pathname.startsWith('/admin')) {
      if (!token || token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', req.url))
      }
    }

    // Dashboard routes - accessible by authenticated users
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/surveys') || pathname.startsWith('/calendar')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }: any) => {
        const { pathname } = req.nextUrl

        // Always allow root path
        if (pathname === '/') {
          return true
        }

        // Allow access to auth pages
        if (pathname.startsWith('/auth')) {
          return true
        }

        // Allow access to all API routes
        if (pathname.startsWith('/api')) {
          return true
        }

        // Allow access to survey submission pages (public)
        if (pathname.startsWith('/survey/') && !pathname.includes('/results')) {
          return true
        }

        // Allow access to static files
        if (pathname.startsWith('/_next') || 
            pathname.startsWith('/favicon') || 
            pathname.startsWith('/public') ||
            pathname.includes('.')) {
          return true
        }

        // Require authentication for protected routes
        if (pathname.startsWith('/admin') || 
            pathname.startsWith('/dashboard') || 
            pathname.startsWith('/surveys') || 
            pathname.startsWith('/calendar')) {
          return !!token
        }

        // Allow everything else for now
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api/auth (NextAuth endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}