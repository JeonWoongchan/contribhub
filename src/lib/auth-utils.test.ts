import { describe, it, expect, vi, afterEach } from 'vitest'
import { requireGithubToken } from '@/lib/auth-utils'
import { ErrorCode } from '@/lib/api-response'
import { NextRequest } from 'next/server'
import type { Mock } from 'vitest'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }))
vi.mock('@/lib/env', () => ({ env: { AUTH_SECRET: 'test-secret' } }))

import { auth } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>
const mockGetToken = getToken as unknown as Mock<() => Promise<JWT | null>>

afterEach(() => vi.clearAllMocks())

const req = new NextRequest('http://localhost/api/test')
const session = {
  user: {
    id: 'user-1',
    login: 'testuser',
    isOnboarded: true,
  },
  expires: '2099-01-01T00:00:00.000Z',
} satisfies Session

describe('requireGithubToken', () => {
  it('세션이 없으면 UNAUTHORIZED 에러를 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const result = await requireGithubToken(req)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.status).toBe(401)
    expect(result.code).toBe(ErrorCode.UNAUTHORIZED)
  })

  it('세션은 있지만 JWT에 accessToken이 없으면 NO_ACCESS_TOKEN 에러를 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(session)
    mockGetToken.mockResolvedValueOnce({ sub: 'user-1' })

    const result = await requireGithubToken(req)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.status).toBe(401)
    expect(result.code).toBe(ErrorCode.NO_ACCESS_TOKEN)
  })

  it('세션과 accessToken이 모두 있으면 인증 정보를 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(session)
    mockGetToken.mockResolvedValueOnce({
      accessToken: 'gh-token',
      githubLogin: 'testuser',
    })

    const result = await requireGithubToken(req)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.userId).toBe('user-1')
    expect(result.accessToken).toBe('gh-token')
    expect(result.githubLogin).toBe('testuser')
  })

  it('JWT에 githubLogin이 없으면 빈 문자열로 대체한다', async () => {
    mockAuth.mockResolvedValueOnce(session)
    mockGetToken.mockResolvedValueOnce({ accessToken: 'gh-token' })

    const result = await requireGithubToken(req)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.githubLogin).toBe('')
  })
})
