import { describe, it, expect, vi, afterEach } from 'vitest'
import { requireGithubToken } from '@/lib/auth-utils'
import { ErrorCode } from '@/lib/api-response'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }))
vi.mock('@/lib/env', () => ({ env: { AUTH_SECRET: 'test-secret' } }))

import { auth } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
const mockAuth = vi.mocked(auth)
const mockGetToken = vi.mocked(getToken)

afterEach(() => vi.clearAllMocks())

const req = new NextRequest('http://localhost/api/test')

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
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never)
    mockGetToken.mockResolvedValueOnce({ sub: 'user-1' } as never)

    const result = await requireGithubToken(req)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.status).toBe(401)
    expect(result.code).toBe(ErrorCode.NO_ACCESS_TOKEN)
  })

  it('세션과 accessToken이 모두 있으면 인증 정보를 반환한다', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never)
    mockGetToken.mockResolvedValueOnce({
      accessToken: 'gh-token',
      githubLogin: 'testuser',
    } as never)

    const result = await requireGithubToken(req)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.userId).toBe('user-1')
    expect(result.accessToken).toBe('gh-token')
    expect(result.githubLogin).toBe('testuser')
  })

  it('JWT에 githubLogin이 없으면 빈 문자열로 대체한다', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } } as never)
    mockGetToken.mockResolvedValueOnce({ accessToken: 'gh-token' } as never)

    const result = await requireGithubToken(req)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.githubLogin).toBe('')
  })
})
