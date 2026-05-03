import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchIssueListPage } from '@/lib/github/issues/service'
import { encodeBatch, INITIAL_BATCH } from '@/lib/github/batch'
import { PAGE_SIZE } from '@/constants/scoring-rules'
import type { OnboardingProfile } from '@/lib/user/profile'
import type { RawIssue, ScoredIssue } from '@/types/issue'
import type { IssueSearchResult } from '@/lib/github/issues/search'

vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn }))
vi.mock('@/lib/github/issues/search', () => ({ fetchCandidateIssues: vi.fn() }))
vi.mock('@/lib/github/issues/health', () => ({ getRepoHealthMap: vi.fn() }))
vi.mock('@/lib/github/issues/ranking', () => ({ rankIssues: vi.fn() }))
vi.mock('@/lib/github/issues/filters', () => ({ applyFilters: vi.fn() }))
vi.mock('@/lib/bookmarks', () => ({ listUserBookmarkKeys: vi.fn() }))

import { fetchCandidateIssues } from '@/lib/github/issues/search'
import { getRepoHealthMap } from '@/lib/github/issues/health'
import { rankIssues } from '@/lib/github/issues/ranking'
import { applyFilters } from '@/lib/github/issues/filters'
import { listUserBookmarkKeys } from '@/lib/bookmarks'

const mockSearch = vi.mocked(fetchCandidateIssues)
const mockHealthMap = vi.mocked(getRepoHealthMap)
const mockRank = vi.mocked(rankIssues)
const mockFilter = vi.mocked(applyFilters)
const mockBookmarks = vi.mocked(listUserBookmarkKeys)

afterEach(() => vi.clearAllMocks())

const profile: OnboardingProfile = {
  topLanguages: ['TypeScript'],
  experienceLevel: 'mid',
  contributionTypes: ['bug'],
  weeklyHours: 5,
  purpose: 'growth',
}

const baseArgs = {
  userId: 'user-1',
  accessToken: 'token',
  profile,
  filters: {},
  offset: 0,
  batchParam: INITIAL_BATCH,
}

function makeSearchResult(overrides: Partial<IssueSearchResult> = {}): IssueSearchResult {
  return {
    issues: [],
    endCursors: {},
    hasMoreOnGithub: false,
    failedQueryCount: 0,
    totalQueryCount: 1,
    rateLimited: false,
    unauthorized: false,
    ...overrides,
  }
}

// service.ts의 searchResult.issues는 RawIssue — repository.nameWithOwner 필수
function makeRawIssue(overrides: Partial<RawIssue> = {}): RawIssue {
  return {
    number: 1,
    title: 'Test issue',
    url: 'https://github.com/owner/repo/issues/1',
    body: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    comments: { totalCount: 0 },
    labels: { nodes: [] },
    repository: {
      nameWithOwner: 'owner/repo',
      url: 'https://github.com/owner/repo',
      primaryLanguage: { name: 'TypeScript' },
      stargazerCount: 100,
    },
    timelineItems: { nodes: [] },
    ...overrides,
  }
}

// rankIssues의 반환값은 ScoredIssue
function makeScoredIssue(overrides: Partial<ScoredIssue> = {}): ScoredIssue {
  return {
    number: 1,
    title: 'Test issue',
    url: 'https://github.com/owner/repo/issues/1',
    repoFullName: 'owner/repo',
    repoUrl: 'https://github.com/owner/repo',
    language: 'TypeScript',
    stargazerCount: 100,
    labels: [],
    commentCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    score: 50,
    difficultyLevel: null,
    contributionType: null,
    competitionLevel: 'low',
    hasPR: false,
    isBookmarked: false,
    healthScore: 80,
    ...overrides,
  }
}

function setupDeps(
  rawIssues: RawIssue[],
  scoredIssues: ScoredIssue[],
  searchOverrides: Partial<IssueSearchResult> = {}
) {
  mockSearch.mockResolvedValue(makeSearchResult({ issues: rawIssues, ...searchOverrides }))
  mockHealthMap.mockResolvedValue({})
  mockBookmarks.mockResolvedValue([])
  mockRank.mockReturnValue(scoredIssues)
  mockFilter.mockImplementation((issues) => issues)  // isBookmarked 설정 후의 rankedIssues를 그대로 통과
}

describe('fetchIssueListPage — 에러 반환', () => {
  it('rate_limited이고 이슈가 없으면 { error: rate_limited }를 반환한다', async () => {
    setupDeps([])
    mockSearch.mockResolvedValue(makeSearchResult({ rateLimited: true, issues: [], totalQueryCount: 1, failedQueryCount: 1 }))

    const result = await fetchIssueListPage(baseArgs)

    expect(result).toEqual({ error: 'rate_limited' })
  })

  it('unauthorized이고 이슈가 없으면 { error: unauthorized }를 반환한다', async () => {
    mockSearch.mockResolvedValue(makeSearchResult({ unauthorized: true, issues: [], totalQueryCount: 1, failedQueryCount: 1 }))
    mockBookmarks.mockResolvedValue([])

    const result = await fetchIssueListPage(baseArgs)

    expect(result).toEqual({ error: 'unauthorized' })
  })

  it('모든 쿼리가 실패하면 { error: all_failed }를 반환한다', async () => {
    mockSearch.mockResolvedValue(makeSearchResult({ failedQueryCount: 2, totalQueryCount: 2, issues: [] }))
    mockBookmarks.mockResolvedValue([])

    const result = await fetchIssueListPage(baseArgs)

    expect(result).toEqual({ error: 'all_failed' })
  })

  it('rate_limited여도 이슈가 있으면 에러를 반환하지 않는다', async () => {
    const raw = [makeRawIssue()]
    const scored = [makeScoredIssue()]
    setupDeps(raw, scored, { rateLimited: true, failedQueryCount: 1, totalQueryCount: 2 })

    const result = await fetchIssueListPage(baseArgs)

    expect('error' in result).toBe(false)
  })
})

describe('fetchIssueListPage — 페이지네이션', () => {
  it('이슈 수가 PAGE_SIZE 이하면 isLastPage이고 nextBatch=null이다', async () => {
    const scored = Array.from({ length: PAGE_SIZE - 1 }, (_, i) => makeScoredIssue({ number: i + 1 }))
    setupDeps([makeRawIssue()], scored)

    const result = await fetchIssueListPage(baseArgs)

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.nextBatch).toBeNull()
    expect(result.hasMore).toBe(false)
  })

  it('isLastPage이고 GitHub에 다음 페이지가 있으면 nextBatch를 인코딩해 반환한다', async () => {
    const scored = Array.from({ length: PAGE_SIZE }, (_, i) => makeScoredIssue({ number: i + 1 }))
    const endCursors = { TypeScript: 'cursor-abc' }
    setupDeps([makeRawIssue()], scored, { hasMoreOnGithub: true, endCursors })

    const result = await fetchIssueListPage(baseArgs)

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.nextBatch).toBe(encodeBatch(endCursors))
    expect(result.hasMore).toBe(true)
  })

  it('이슈가 PAGE_SIZE 초과면 nextBatch=null이고 hasMore=true이다', async () => {
    const scored = Array.from({ length: PAGE_SIZE + 5 }, (_, i) => makeScoredIssue({ number: i + 1 }))
    setupDeps([makeRawIssue()], scored)

    const result = await fetchIssueListPage(baseArgs)

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.nextBatch).toBeNull()
    expect(result.hasMore).toBe(true)
    expect(result.issues).toHaveLength(PAGE_SIZE)
  })

  it('offset이 적용되어 PAGE_SIZE 만큼 슬라이싱한다', async () => {
    const scored = Array.from({ length: 25 }, (_, i) => makeScoredIssue({ number: i + 1 }))
    setupDeps([makeRawIssue()], scored)

    const result = await fetchIssueListPage({ ...baseArgs, offset: 10 })

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.offset).toBe(10)
    expect(result.issues).toHaveLength(PAGE_SIZE)
    expect(result.issues[0].number).toBe(11)
  })
})

describe('fetchIssueListPage — 북마크 병합', () => {
  it('북마크 키와 일치하는 이슈에 isBookmarked=true를 설정한다', async () => {
    const scored = [
      makeScoredIssue({ repoFullName: 'owner/repo', number: 1 }),
      makeScoredIssue({ repoFullName: 'owner/repo', number: 2 }),
    ]
    mockSearch.mockResolvedValue(makeSearchResult({ issues: [makeRawIssue()] }))
    mockHealthMap.mockResolvedValue({})
    mockBookmarks.mockResolvedValue(['owner/repo#1'])
    mockRank.mockReturnValue(scored)
    mockFilter.mockImplementation((issues) => issues)

    const result = await fetchIssueListPage(baseArgs)

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.issues[0].isBookmarked).toBe(true)
    expect(result.issues[1].isBookmarked).toBe(false)
  })
})

describe('fetchIssueListPage — 메타데이터', () => {
  it('partialResults는 failedQueryCount > 0일 때 true이다', async () => {
    const scored = [makeScoredIssue()]
    setupDeps([makeRawIssue()], scored, { failedQueryCount: 1, totalQueryCount: 2 })

    const result = await fetchIssueListPage(baseArgs)

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.partialResults).toBe(true)
    expect(result.failedQueryCount).toBe(1)
  })

  it('availableLanguages는 null을 제외한 중복 없는 언어 목록이다', async () => {
    const scored = [
      makeScoredIssue({ language: 'TypeScript' }),
      makeScoredIssue({ language: 'TypeScript' }),
      makeScoredIssue({ language: 'Go' }),
      makeScoredIssue({ language: null }),
    ]
    setupDeps([makeRawIssue()], scored)

    const result = await fetchIssueListPage(baseArgs)

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.availableLanguages).toEqual(expect.arrayContaining(['TypeScript', 'Go']))
    expect(result.availableLanguages).toHaveLength(2)
  })
})
