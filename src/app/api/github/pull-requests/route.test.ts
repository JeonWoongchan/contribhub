import { describe, it, expect, vi, afterEach } from 'vitest'
import { GET } from '@/app/api/github/pull-requests/route'
import { ErrorCode } from '@/lib/api-response'
import { NextRequest } from 'next/server'
import { PAGE_SIZE } from '@/constants/scoring-rules'
import type { PullRequestItem, PullRequestSummary } from '@/types/pull-request'

vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn }))
vi.mock('@/lib/auth-utils', () => ({ requireGithubToken: vi.fn() }))
vi.mock('@/lib/github/pull-requests', () => ({ fetchViewerPullRequests: vi.fn() }))
vi.mock('@/lib/github/error-response', () => ({ getGitHubErrorResponse: vi.fn() }))

import { requireGithubToken } from '@/lib/auth-utils'
import { fetchViewerPullRequests } from '@/lib/github/pull-requests'
import { getGitHubErrorResponse } from '@/lib/github/error-response'

const mockAuth    = vi.mocked(requireGithubToken)
const mockFetch   = vi.mocked(fetchViewerPullRequests)
const mockErrResp = vi.mocked(getGitHubErrorResponse)

afterEach(() => vi.clearAllMocks())

function authOk() {
    mockAuth.mockResolvedValue({
        ok: true,
        userId: 'user-1',
        accessToken: 'token',
        githubLogin: 'testuser',
    })
}

function req(params = '') {
    return new NextRequest(`http://localhost/api/github/pull-requests${params}`)
}

const emptySummary: PullRequestSummary = {
    totalCount: 0,
    mergedCount: 0,
    openCount: 0,
    closedCount: 0,
    totalAdditions: 0,
    totalDeletions: 0,
}

function makePRItem(state: PullRequestItem['state'] = 'OPEN'): PullRequestItem {
    return {
        title: 'Test PR',
        url: 'https://github.com/owner/repo/pull/1',
        state,
        createdAt: '2024-01-01T00:00:00Z',
        mergedAt: null,
        closedAt: null,
        additions: 10,
        deletions: 5,
        changedFiles: 2,
        commentCount: 0,
        reviewCount: 0,
        commitCount: 1,
        labels: [],
        repoFullName: 'owner/repo',
        repoUrl: 'https://github.com/owner/repo',
        stargazerCount: 100,
        language: 'TypeScript',
    }
}

describe('GET /api/github/pull-requests', () => {
    it('인증 실패 시 인증 에러를 반환한다', async () => {
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

    it('정상 요청은 200과 PR 목록을 반환한다', async () => {
        authOk()
        mockFetch.mockResolvedValue({ items: [makePRItem()], summary: emptySummary })

        const res = await GET(req('?offset=0'))
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json.ok).toBe(true)
        expect(json.data.items).toHaveLength(1)
        expect(json.data.total).toBe(1)
    })

    it('state=OPEN 필터는 OPEN 상태 PR만 반환한다', async () => {
        authOk()
        mockFetch.mockResolvedValue({
            items: [makePRItem('OPEN'), makePRItem('MERGED'), makePRItem('CLOSED')],
            summary: emptySummary,
        })

        const res = await GET(req('?state=OPEN'))
        const json = await res.json()

        expect(json.data.total).toBe(1)
        expect(json.data.items[0].state).toBe('OPEN')
    })

    it('허용되지 않은 state("DRAFT")는 null로 처리해 전체 PR을 반환한다', async () => {
        authOk()
        mockFetch.mockResolvedValue({
            items: [makePRItem('OPEN'), makePRItem('MERGED')],
            summary: emptySummary,
        })

        const res = await GET(req('?state=DRAFT'))
        const json = await res.json()

        // DRAFT는 stateSchema에서 null로 폴백 → 필터 없음 → 전체 2개
        expect(json.data.total).toBe(2)
    })

    it('offset이 적용되어 PR 목록을 슬라이싱한다', async () => {
        authOk()
        const items = Array.from({ length: 15 }, () => makePRItem())
        mockFetch.mockResolvedValue({ items, summary: emptySummary })

        const res = await GET(req('?offset=10'))
        const json = await res.json()

        expect(json.data.offset).toBe(10)
        expect(json.data.items).toHaveLength(5)
        expect(json.data.hasMore).toBe(false)
    })

    it('hasMore는 offset + PAGE_SIZE < total일 때 true다', async () => {
        authOk()
        const items = Array.from({ length: PAGE_SIZE + 1 }, () => makePRItem())
        mockFetch.mockResolvedValue({ items, summary: emptySummary })

        const res = await GET(req('?offset=0'))
        const json = await res.json()

        expect(json.data.hasMore).toBe(true)
        expect(json.data.total).toBe(PAGE_SIZE + 1)
    })

    it('예외 발생 시 getGitHubErrorResponse를 호출한다', async () => {
        authOk()
        const error = new Error('network failure')
        mockFetch.mockRejectedValue(error)
        mockErrResp.mockReturnValue(
            new Response(JSON.stringify({ ok: false }), { status: 502 }) as never
        )

        await GET(req())

        expect(mockErrResp).toHaveBeenCalledWith(
            error,
            expect.objectContaining({ fallbackMessage: expect.any(String) })
        )
    })
})
