import { describe, it, expect, vi, afterEach } from 'vitest'
import { GET, POST, DELETE } from '@/app/api/bookmarks/route'
import { ErrorCode } from '@/lib/api-response'
import { NextRequest } from 'next/server'
import type { Mock } from 'vitest'
import type { Session } from 'next-auth'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/auth-utils', () => ({ requireGithubToken: vi.fn() }))
vi.mock('@/lib/bookmarks', () => ({ createBookmark: vi.fn(), deleteBookmark: vi.fn() }))
vi.mock('@/lib/bookmark-list', () => ({ getBookmarkList: vi.fn() }))

import { auth } from '@/lib/auth'
import { requireGithubToken } from '@/lib/auth-utils'
import { createBookmark, deleteBookmark } from '@/lib/bookmarks'
import { getBookmarkList } from '@/lib/bookmark-list'
const mockAuth = auth as unknown as Mock<() => Promise<Session | null>>
const mockRequireToken = vi.mocked(requireGithubToken)
const mockCreate = vi.mocked(createBookmark)
const mockDelete = vi.mocked(deleteBookmark)
const mockGetList = vi.mocked(getBookmarkList)

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

// ─── 헬퍼 ───────────────────────────────────────────────────────────────────

function authOk() {
  mockRequireToken.mockResolvedValue({
    ok: true,
    userId: 'user-1',
    accessToken: 'token',
    githubLogin: 'testuser',
  })
}

function authFail() {
  mockRequireToken.mockResolvedValue({
    ok: false,
    error: 'Unauthorized',
    status: 401,
    code: ErrorCode.UNAUTHORIZED,
  })
}

function silenceConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => undefined)
}

const validPostBody = {
  issueNumber: 42,
  repoFullName: 'owner/repo',
  issueTitle: 'Fix login bug',
  issueUrl: 'https://github.com/owner/repo/issues/42',
  contributionType: 'bug',
}

const session = {
  user: {
    id: 'user-1',
    login: 'testuser',
    isOnboarded: true,
  },
  expires: '2099-01-01T00:00:00.000Z',
} satisfies Session

// ─── GET ─────────────────────────────────────────────────────────────────────

describe('GET /api/bookmarks', () => {
  it('인증 실패 시 401을 반환한다', async () => {
    authFail()

    const res = await GET(new NextRequest('http://localhost/api/bookmarks'))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.ok).toBe(false)
  })

  it('정상 요청 시 북마크 목록을 반환한다', async () => {
    authOk()
    const bookmarkList = { issues: [], pageInfo: { limit: 10, offset: 0, total: 0, hasMore: false } }
    mockGetList.mockResolvedValue(bookmarkList)

    const res = await GET(new NextRequest('http://localhost/api/bookmarks?limit=10&offset=0'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.data).toEqual(bookmarkList)
  })

  it('limit/offset 파라미터가 없으면 기본값을 사용한다', async () => {
    authOk()
    mockGetList.mockResolvedValue({
      issues: [],
      pageInfo: { limit: 10, offset: 0, total: 0, hasMore: false },
    })

    await GET(new NextRequest('http://localhost/api/bookmarks'))

    expect(mockGetList).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 0 })
    )
  })

  it('getBookmarkList 예외 발생 시 500을 반환한다', async () => {
    const consoleError = silenceConsoleError()
    authOk()
    mockGetList.mockRejectedValue(new Error('DB error'))

    const res = await GET(new NextRequest('http://localhost/api/bookmarks'))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.ok).toBe(false)
    expect(consoleError).toHaveBeenCalledOnce()
  })
})

// ─── POST ────────────────────────────────────────────────────────────────────

describe('POST /api/bookmarks', () => {
  it('미로그인 시 401을 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const res = await POST(new Request('http://localhost/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify(validPostBody),
    }))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.ok).toBe(false)
  })

  it('요청 body가 JSON이 아니면 400을 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(session)

    const res = await POST(new Request('http://localhost/api/bookmarks', {
      method: 'POST',
      body: 'not-json',
    }))

    expect(res.status).toBe(400)
  })

  it('필수 필드 누락 시 400을 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(session)
    const invalid = {
      issueNumber: validPostBody.issueNumber,
      repoFullName: validPostBody.repoFullName,
      issueUrl: validPostBody.issueUrl,
      contributionType: validPostBody.contributionType,
    }

    const res = await POST(new Request('http://localhost/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify(invalid),
    }))

    expect(res.status).toBe(400)
  })

  it('정상 요청 시 201과 { saved: true }를 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(session)
    mockCreate.mockResolvedValueOnce(undefined)

    const res = await POST(new Request('http://localhost/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify(validPostBody),
    }))
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.data.saved).toBe(true)
  })

  it('createBookmark 예외 발생 시 500을 반환한다', async () => {
    const consoleError = silenceConsoleError()
    mockAuth.mockResolvedValueOnce(session)
    mockCreate.mockRejectedValue(new Error('DB error'))

    const res = await POST(new Request('http://localhost/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify(validPostBody),
    }))

    expect(res.status).toBe(500)
    expect(consoleError).toHaveBeenCalledOnce()
  })
})

// ─── DELETE ──────────────────────────────────────────────────────────────────

describe('DELETE /api/bookmarks', () => {
  it('미로그인 시 401을 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const res = await DELETE(new Request('http://localhost/api/bookmarks', {
      method: 'DELETE',
      body: JSON.stringify({ issueNumber: 42, repoFullName: 'owner/repo' }),
    }))

    expect(res.status).toBe(401)
  })

  it('필수 필드 누락 시 400을 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(session)

    const res = await DELETE(new Request('http://localhost/api/bookmarks', {
      method: 'DELETE',
      body: JSON.stringify({ issueNumber: 42 }),
    }))

    expect(res.status).toBe(400)
  })

  it('정상 요청 시 200과 { deleted: true }를 반환한다', async () => {
    mockAuth.mockResolvedValueOnce(session)
    mockDelete.mockResolvedValueOnce(undefined)

    const res = await DELETE(new Request('http://localhost/api/bookmarks', {
      method: 'DELETE',
      body: JSON.stringify({ issueNumber: 42, repoFullName: 'owner/repo' }),
    }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.deleted).toBe(true)
  })

  it('deleteBookmark 예외 발생 시 500을 반환한다', async () => {
    const consoleError = silenceConsoleError()
    mockAuth.mockResolvedValueOnce(session)
    mockDelete.mockRejectedValue(new Error('DB error'))

    const res = await DELETE(new Request('http://localhost/api/bookmarks', {
      method: 'DELETE',
      body: JSON.stringify({ issueNumber: 42, repoFullName: 'owner/repo' }),
    }))

    expect(res.status).toBe(500)
    expect(consoleError).toHaveBeenCalledOnce()
  })
})
