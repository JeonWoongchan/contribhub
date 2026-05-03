import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/mypage/activity/route'
import { ErrorCode } from '@/lib/api-response'
import { GitHubUnauthorizedError } from '@/lib/github/client'

vi.mock('@/lib/auth-utils', () => ({ requireGithubToken: vi.fn() }))
vi.mock('@/lib/user/my-page', () => ({ getMyPageActivity: vi.fn() }))
vi.mock('@/lib/env', () => ({
  env: {
    AUTH_SECRET: 'test-secret',
    DATABASE_URL: 'postgres://test',
    GITHUB_CLIENT_ID: 'client-id',
    GITHUB_CLIENT_SECRET: 'client-secret',
  },
}))

import { requireGithubToken } from '@/lib/auth-utils'
import { getMyPageActivity } from '@/lib/user/my-page'

const mockRequireGithubToken = vi.mocked(requireGithubToken)
const mockGetMyPageActivity = vi.mocked(getMyPageActivity)

afterEach(() => vi.clearAllMocks())

function req() {
  return new NextRequest('http://localhost/api/mypage/activity')
}

function authOk() {
  mockRequireGithubToken.mockResolvedValue({
    ok: true,
    userId: 'user-1',
    accessToken: 'token',
    githubLogin: 'testuser',
  })
}

describe('GET /api/mypage/activity', () => {
  it('인증 실패 시 401을 반환한다', async () => {
    mockRequireGithubToken.mockResolvedValue({
      ok: false,
      error: 'Unauthorized',
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
    })

    const res = await GET(req())
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error?.code).toBe(ErrorCode.UNAUTHORIZED)
  })

  it('활동 데이터를 반환한다', async () => {
    authOk()
    const activity = {
      bookmarkCount: 2,
      pullRequestCount: 3,
      mergedPullRequestCount: 1,
    }
    mockGetMyPageActivity.mockResolvedValueOnce(activity)

    const res = await GET(req())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.data).toEqual(activity)
    expect(mockGetMyPageActivity).toHaveBeenCalledWith('user-1', 'token', 'testuser')
  })

  it('GitHub 인증 예외는 401로 반환한다', async () => {
    authOk()
    mockGetMyPageActivity.mockRejectedValueOnce(new GitHubUnauthorizedError())

    const res = await GET(req())
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error?.code).toBe(ErrorCode.UNAUTHORIZED)
  })

  it('일반 예외는 INTERNAL_ERROR 500으로 반환한다', async () => {
    authOk()
    mockGetMyPageActivity.mockRejectedValueOnce(new Error('DB error'))

    const res = await GET(req())
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error?.code).toBe(ErrorCode.INTERNAL_ERROR)
  })
})
