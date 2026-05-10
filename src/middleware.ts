import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Edge Runtime에서 실행 — JWT를 직접 복호화해 인증·온보딩 상태를 확인한다.
// DB·Node.js 모듈 없이 처리하므로 Vercel cold start 없이 수십ms로 동작한다.
export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production',
    })

    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (!token.isOnboarded) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    return NextResponse.redirect(new URL('/dashboard', req.url))
}

export const config = {
    matcher: ['/'],
}
