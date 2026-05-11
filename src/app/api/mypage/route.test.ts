import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/mypage/route'
import { ErrorCode } from '@/lib/api-response'
import type { Mock } from 'vitest'
import type { Session } from 'next-auth'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/user/my-page', () => ({ getMyPageData: vi.fn() }))

import { auth } from '@/lib/auth'
import { getMyPageData } from '@/lib/user/my-page'

const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>
const mockGetMyPageData = vi.mocked(getMyPageData)

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

const session = {
  user: {
    id: 'user-1',
    login: 'testuser',
    name: 'Test User',
    isOnboarded: true,
  },
  expires: '2099-01-01T00:00:00.000Z',
} satisfies Session

const myPageData = {
  profile: {
    name: 'Test User',
    login: 'testuser',
    image: null,
    joinedAt: '2024-01-01T00:00:00.000Z',
    githubProfileUrl: 'https://github.com/testuser',
  },
  onboarding: {
    topLanguages: ['TypeScript'],
    experienceLevel: 'mid' as const,
    contributionTypes: ['bug' as const],
    weeklyHours: 5 as const,
    purpose: 'growth' as const,
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
}

function silenceConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => undefined)
}

describe('GET /api/mypage', () => {
  it('미로그인 시 401을 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error?.code).toBe(ErrorCode.UNAUTHORIZED)
  })

  it('마이페이지 데이터를 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(session)
    mockGetMyPageData.mockResolvedValueOnce(myPageData)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.data).toEqual(myPageData)
    expect(mockGetMyPageData).toHaveBeenCalledWith('user-1', 'Test User')
  })

  it('데이터가 없으면 구조화된 500을 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(session)
    mockGetMyPageData.mockResolvedValueOnce(null)

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error?.code).toBe(ErrorCode.INTERNAL_ERROR)
  })

  it('DB 예외 발생 시 구조화된 500을 반환한다', async () => {
    const consoleError = silenceConsoleError()
    mockAuth.mockResolvedValueOnce(session)
    mockGetMyPageData.mockRejectedValueOnce(new Error('DB error'))

    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error?.code).toBe(ErrorCode.INTERNAL_ERROR)
    expect(consoleError).toHaveBeenCalledOnce()
  })
})
