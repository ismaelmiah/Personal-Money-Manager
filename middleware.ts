// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  // Protect all routes except the ones for API calls, Next.js assets, and auth
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth).*)'],
};