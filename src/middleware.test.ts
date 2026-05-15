import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import type { JWT } from 'next-auth/jwt'
import type { Mock } from 'vitest'

vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }))

import { getToken } from 'next-auth/jwt'
import { middleware } from '@/middleware'

const mockGetToken = getToken as unknown as Mock<() => Promise<JWT | null>>

afterEach(() => vi.clearAllMocks())

function makeReq(path = '/') {
    return new NextRequest(`https://openissuemap.com${path}`)
}

function redirectPath(res: Response): string {
    return new URL(res.headers.get('location')!).pathname
}

describe('middleware — / 라우팅 분기', () => {
    describe('미인증 사용자', () => {
        it('JWT가 없으면 공개 루트 페이지를 그대로 보여준다', async () => {
            mockGetToken.mockResolvedValueOnce(null)

            const res = await middleware(makeReq())

            expect(res.headers.get('location')).toBeNull()
        })
    })

    describe('온보딩 미완료 사용자', () => {
        it('isOnboarded가 false이면 /onboarding으로 리다이렉트한다', async () => {
            mockGetToken.mockResolvedValueOnce({ isOnboarded: false } as JWT)

            const res = await middleware(makeReq())

            expect(redirectPath(res)).toBe('/onboarding')
        })

        it('isOnboarded가 undefined이면 /onboarding으로 리다이렉트한다', async () => {
            // 기존 세션(이전 배포 이전 JWT)에 isOnboarded 필드가 없을 때
            mockGetToken.mockResolvedValueOnce({ sub: 'user-1' } as JWT)

            const res = await middleware(makeReq())

            expect(redirectPath(res)).toBe('/onboarding')
        })
    })

    describe('인증 + 온보딩 완료 사용자', () => {
        it('isOnboarded가 true이면 /dashboard로 리다이렉트한다', async () => {
            mockGetToken.mockResolvedValueOnce({ isOnboarded: true } as JWT)

            const res = await middleware(makeReq())

            expect(redirectPath(res)).toBe('/dashboard')
        })
    })

    describe('리다이렉트 동작', () => {
        it('리다이렉트 응답의 Location 헤더가 요청과 같은 origin을 가진다', async () => {
            mockGetToken.mockResolvedValueOnce({ isOnboarded: false } as JWT)

            const res = await middleware(makeReq())

            const location = new URL(res.headers.get('location')!)
            expect(location.origin).toBe('https://openissuemap.com')
        })

        it('getToken이 정확히 1회 호출된다', async () => {
            mockGetToken.mockResolvedValueOnce(null)

            await middleware(makeReq())

            expect(mockGetToken).toHaveBeenCalledOnce()
        })

        it('getToken에 req가 전달된다', async () => {
            mockGetToken.mockResolvedValueOnce(null)
            const req = makeReq()

            await middleware(req)

            expect(mockGetToken).toHaveBeenCalledWith(
                expect.objectContaining({ req }),
            )
        })
    })
})
