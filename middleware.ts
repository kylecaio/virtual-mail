import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
          const token = req.nextauth.token;
          const path = req.nextUrl.pathname;

      // Admin routes require ADMIN or STAFF role
      if (path.startsWith('/admin')) {
              if (token?.role !== 'ADMIN' && token?.role !== 'STAFF') {
                        return NextResponse.redirect(new URL('/dashboard', req.url));
              }
      }

      return NextResponse.next();
    },
  {
        callbacks: {
                authorized: ({ token }) => !!token,
        },
  }
  );

export const config = {
    matcher: [
          '/dashboard/:path*',
          '/mail/:path*',
          '/requests/:path*',
          '/billing/:path*',
          '/settings/:path*',
          '/admin/:path*',
        ],
};
