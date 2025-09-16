import { clerkMiddleware } from '@clerk/nextjs/server';

// This example protects all routes including api/trpc routes.
// See https://clerk.com/docs/references/nextjs/auth-middleware
// for more information about configuring your middleware.
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};