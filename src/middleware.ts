import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { err, ErrorCode } from '@/lib/api-response'

// 서버리스 환경에서는 인스턴스 간 상태 공유 불가 — 단일 인스턴스 내 요청 수 제한
// 프로덕션 수준의 rate limiting이 필요하면 Upstash Redis 등 외부 스토어로 교체 필요
const requestMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 60

let lastPurgeAt = 0

function getIp(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

// 재방문 없는 IP가 Map에 무기한 축적되는 것을 방지
function purgeExpired(now: number) {
    for (const [ip, entry] of requestMap) {
        if (entry.resetAt < now) requestMap.delete(ip)
    }
}

export function middleware(req: NextRequest) {
    const now = Date.now()

    if (now - lastPurgeAt > RATE_LIMIT_WINDOW_MS) {
        purgeExpired(now)
        lastPurgeAt = now
    }

    const ip = getIp(req)
    const entry = requestMap.get(ip)

    if (!entry || entry.resetAt < now) {
        requestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
        return NextResponse.next()
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return err('요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', 429, ErrorCode.RATE_LIMITED)
    }

    entry.count++
    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}
