import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis'; // আপনার প্রজেক্টের আপস্ট্যাশ রেডিস ইন্সট্যান্স

// Upstash Ratelimit সেটআপ: প্রতি ৬০ সেকেন্ডে সর্বোচ্চ ৬০টি রিকোয়েস্ট
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, '60 s'),
  analytics: true,
  prefix: 'app_ratelimit',
});

export async function proxy(req) {
  try {
    // --- ১. Upstash Redis রেট লিমিট লজিক (নিরাপদ ও ফলব্যাক সহ) ---
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
              || req.headers.get('x-real-ip')
              || '127.0.0.1';

      const { success, limit, remaining, reset } = await ratelimit.limit(ip);

      if (!success) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Too many requests, please try again later.' }),
          { 
            status: 429, 
            headers: { 
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            } 
          }
        );
      }
    } catch (rateLimitErr) {
      // রেডিসে কোনো সমস্যা বা নেটওয়ার্ক এরর হলে কোড ক্র্যাশ না করে সাইলেন্টলি পাস করবে
      console.error('Rate limit error (Non-blocking):', rateLimitErr);
    }
    // ------------------------------------------------------------

    const { pathname } = req.nextUrl;

    // ২. পাবলিক API পাথ (লগইন ছাড়াই অ্যাক্সেসযোগ্য)
    const publicApiPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/reset-password',
      '/api/admin/seed'
    ];
    const isPublicApi = publicApiPaths.some((path) => pathname.startsWith(path));

    // ৩. সম্পূর্ণ protected routes list (lgame, deposit, withdraw সহ)
    const protectedRoutes = [
      '/profile',
      '/wallet',
      '/game',
      '/gameroom',
      '/referral',
      '/admin',
      '/api',
      '/deposit',
      '/withdraw'
    ];
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    // ৪. সিকিউরিটি চেক — শুধু HttpOnly token cookie
    if (isProtectedRoute && !isPublicApi) {
      const token = req.cookies.get('token')?.value;

      if (!token) {
        // API request → JSON response
        if (pathname.startsWith('/api')) {
          return NextResponse.json(
            { success: false, message: 'অনুমোদিত নয়! সিকিউর কুকি বা সেশন পাওয়া যায়নি।' },
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Page request → login-এ redirect
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // ৫. সব ঠিক থাকলে সিকিউরিটি হেডার সহ পাস
    const response = NextResponse.next();

    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Proxy main error:', error);
    return NextResponse.next();
  }
}

// সম্পূর্ণ matcher — lgame, deposit, withdraw সহ
export const config = {
  matcher: [
    '/profile/:path*',
    '/wallet/:path*',
    '/game/:path*',
    '/gameroom/:path*',
    '/referral/:path*',
    '/api/:path*',
    '/admin/:path*',
    '/deposit/:path*',
    '/withdraw/:path*'
  ],
};