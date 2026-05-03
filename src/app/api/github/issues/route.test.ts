import { describe, it, expect, vi, afterEach } from 'vitest'
import { GET } from '@/app/api/github/issues/route'
import { ErrorCode } from '@/lib/api-response'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth-utils', () => ({ requireGithubToken: vi.fn() }))
vi.mock('@/lib/user/profile', () => ({ loadOnboardingProfile: vi.fn() }))
vi.mock('@/lib/github/issues/service', () => ({ fetchIssueListPage: vi.fn() }))
vi.mock('@/lib/github/error-response', () => ({
  GITHUB_RATE_LIMITED_MESSAGE: 'GitHub API 요청 한도를 초과했습니다.',
  GITHUB_UNAUTHORIZED_MESSAGE: 'GitHub 인증이 만료되었습니다. 다시 로그인해 주세요.',
}))

import { requireGithubToken } from '@/lib/auth-utils'
import { loadOnboardingProfile } from '@/lib/user/profile'
import { fetchIssueListPage } from '@/lib/github/issues/service'
const mockAuth = vi.mocked(requireGithubToken)
const mockProfile = vi.mocked(loadOnboardingProfile)
const mockFetch = vi.mocked(fetchIssueListPage)

afterEach(() => vi.clearAllMocks())

const profile = {
  topLanguages: ['TypeScript'],
  experienceLevel: 'mid' as const,
  contributionTypes: ['bug' as const],
  weeklyHours: 5 as const,
  purpose: 'growth' as const,
}

function authOk() {
  mockAuth.mockResolvedValue({
    ok: true,
    userId: 'user-1',
    accessToken: 'token',
    githubLogin: 'testuser',
  })
}

function req(params = '') {
  return new NextRequest(`http://localhost/api/github/issues${params}`)
}

describe('GET /api/github/issues', () => {
  it('인증 실패 시 401을 반환한다', async () => {
    mockAuth.mockResolvedValue({
      ok: false,
      error: 'Unauthorized',
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
    })

    const res = await GET(req())
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.ok).toBe(false)
  })

  it('온보딩 미완료 시 400 ONBOARDING_REQUIRED를 반환한다', async () => {
    authOk()
    mockProfile.mockResolvedValue(null)

    const res = await GET(req())
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error?.code).toBe(ErrorCode.ONBOARDING_REQUIRED)
  })

  it('rate_limited 에러 시 429를 반환한다', async () => {
    authOk()
    mockProfile.mockResolvedValue(profile)
    mockFetch.mockResolvedValue({ error: 'rate_limited' })

    const res = await GET(req())
    const json = await res.json()

    expect(res.status).toBe(429)
    expect(json.error?.code).toBe(ErrorCode.RATE_LIMITED)
  })

  it('unauthorized 에러 시 401 UNAUTHORIZED를 반환한다', async () => {
    authOk()
    mockProfile.mockResolvedValue(profile)
    mockFetch.mockResolvedValue({ error: 'unauthorized' })

    const res = await GET(req())
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error?.code).toBe(ErrorCode.UNAUTHORIZED)
  })

  it('all_failed 에러 시 502를 반환한다', async () => {
    authOk()
    mockProfile.mockResolvedValue(profile)
    mockFetch.mockResolvedValue({ error: 'all_failed' })

    const res = await GET(req())

    expect(res.status).toBe(502)
  })

  it('정상 결과는 200으로 반환한다', async () => {
    authOk()
    mockProfile.mockResolvedValue(profile)
    const issueData = {
      issues: [], total: 0, hasMore: false,
      offset: 0, batch: 'initial', nextBatch: null,
      availableLanguages: [], partialResults: false, failedQueryCount: 0,
    }
    mockFetch.mockResolvedValue(issueData)

    const res = await GET(req('?offset=0'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.data).toEqual(issueData)
  })

  it('예외 발생 시 500을 반환한다', async () => {
    authOk()
    mockProfile.mockResolvedValue(profile)
    mockFetch.mockRejectedValue(new Error('unexpected'))

    const res = await GET(req())
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error?.code).toBe(ErrorCode.INTERNAL_ERROR)
  })

  it('offset과 batch 쿼리 파라미터를 fetchIssueListPage에 전달한다', async () => {
    authOk()
    mockProfile.mockResolvedValue(profile)
    mockFetch.mockResolvedValue({ error: 'all_failed' })

    await GET(req('?offset=10&batch=abc123'))

    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 10, batchParam: 'abc123' })
    )
  })
})
