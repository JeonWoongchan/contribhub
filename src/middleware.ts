import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Edge Runtime에서 실행 — DB·Node.js 모듈 없이 쿠키 존재 여부만 확인한다.
// JWT 복호화와 세션 유효성 검증은 (main)/layout.tsx의 auth()가 담당한다.
export function middleware(req: NextRequest) {
    const hasSession =
        req.cookies.has('authjs.session-token') ||
        req.cookies.has('__Secure-authjs.session-token')

    return NextResponse.redirect(
        new URL(hasSession ? '/dashboard' : '/login', req.url),
    )
}

export const config = {
    matcher: ['/'],
}
