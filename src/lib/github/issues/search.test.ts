import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchCandidateIssues } from '@/lib/github/issues/search'
import { GitHubRateLimitError, GitHubUnauthorizedError } from '@/lib/github/client'
import { MIN_CANDIDATE_REPO_STARS } from '@/constants/scoring-rules'

vi.mock('@/lib/github/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/github/client')>()
  return { ...actual, githubGraphQL: vi.fn() }
})

import { githubGraphQL } from '@/lib/github/client'
const mockGraphQL = vi.mocked(githubGraphQL)

afterEach(() => vi.clearAllMocks())

function makeSearchPage(
  urls: string[],
  hasNextPage = false,
  endCursor: string | null = null
) {
  return {
    search: {
      pageInfo: { hasNextPage, endCursor },
      nodes: urls.map((url) => ({ url, repository: { stargazerCount: MIN_CANDIDATE_REPO_STARS } } as never)),
    },
  }
}

function makeIssueNode(url: string, stargazerCount: number) {
  return { url, repository: { stargazerCount } } as never
}

describe('fetchCandidateIssues', () => {
  it('언어 배열이 비어있으면 GitHub 호출 없이 빈 결과를 즉시 반환한다', async () => {
    const result = await fetchCandidateIssues([], 'token')

    expect(mockGraphQL).not.toHaveBeenCalled()
    expect(result).toEqual({
      issues: [],
      endCursors: {},
      hasMoreOnGithub: false,
      failedQueryCount: 0,
      totalQueryCount: 0,
      rateLimited: false,
      unauthorized: false,
    })
  })

  it('모든 쿼리 성공 시 이슈 목록과 언어별 endCursor를 반환한다', async () => {
    mockGraphQL
      .mockResolvedValueOnce(makeSearchPage(['https://github.com/a/b/issues/1'], true, 'cursor-ts'))
      .mockResolvedValueOnce(makeSearchPage(['https://github.com/c/d/issues/2'], false, null))

    const result = await fetchCandidateIssues(['TypeScript', 'Rust'], 'token')

    expect(result.issues).toHaveLength(2)
    expect(result.endCursors['TypeScript']).toBe('cursor-ts')
    expect(result.endCursors['Rust']).toBeNull()
    expect(result.hasMoreOnGithub).toBe(true)
    expect(result.failedQueryCount).toBe(0)
    expect(result.rateLimited).toBe(false)
    expect(result.unauthorized).toBe(false)
  })

  it('GitHubRateLimitError 발생 시 rateLimited=true로 반환한다', async () => {
    mockGraphQL.mockRejectedValueOnce(new GitHubRateLimitError())

    const result = await fetchCandidateIssues(['TypeScript'], 'token')

    expect(result.rateLimited).toBe(true)
    expect(result.unauthorized).toBe(false)
    expect(result.failedQueryCount).toBe(1)
    expect(result.totalQueryCount).toBe(1)
    expect(result.issues).toHaveLength(0)
  })

  it('GitHubUnauthorizedError 발생 시 unauthorized=true로 반환한다', async () => {
    mockGraphQL.mockRejectedValueOnce(new GitHubUnauthorizedError())

    const result = await fetchCandidateIssues(['Go'], 'token')

    expect(result.unauthorized).toBe(true)
    expect(result.rateLimited).toBe(false)
    expect(result.failedQueryCount).toBe(1)
  })

  it('일부 쿼리만 실패하면 성공한 쿼리의 이슈를 반환하고 실패 수를 센다', async () => {
    mockGraphQL
      .mockResolvedValueOnce(makeSearchPage(['https://github.com/a/b/issues/1']))
      .mockRejectedValueOnce(new GitHubRateLimitError())

    const result = await fetchCandidateIssues(['TypeScript', 'Go'], 'token')

    expect(result.issues).toHaveLength(1)
    expect(result.failedQueryCount).toBe(1)
    expect(result.totalQueryCount).toBe(2)
    expect(result.rateLimited).toBe(true)
  })

  it('여러 언어에서 같은 URL의 이슈가 오면 하나만 남긴다', async () => {
    const sameUrl = 'https://github.com/a/b/issues/1'
    mockGraphQL
      .mockResolvedValueOnce(makeSearchPage([sameUrl]))
      .mockResolvedValueOnce(makeSearchPage([sameUrl]))

    const result = await fetchCandidateIssues(['TypeScript', 'JavaScript'], 'token')

    expect(result.issues).toHaveLength(1)
  })

  it('실패한 언어의 endCursor는 결과에 포함되지 않는다', async () => {
    mockGraphQL
      .mockResolvedValueOnce(makeSearchPage([], false, 'ts-cursor'))
      .mockRejectedValueOnce(new Error('timeout'))

    const result = await fetchCandidateIssues(['TypeScript', 'Go'], 'token')

    expect(result.endCursors['TypeScript']).toBe('ts-cursor')
    expect('Go' in result.endCursors).toBe(false)
  })

  it('GitHub 검색 쿼리에 sort:updated-desc가 포함된다', async () => {
    mockGraphQL.mockResolvedValue(makeSearchPage([]))

    await fetchCandidateIssues(['TypeScript'], 'token')

    const [, variables] = mockGraphQL.mock.calls[0] as unknown as [string, { query: string }]
    expect(variables.query).toContain('sort:updated-desc')
  })

  it('stargazerCount가 MIN_CANDIDATE_REPO_STARS 미만인 이슈는 응답에서 제거된다', async () => {
    // GitHub 검색 인덱스와 실제 API 응답 간 시차로 stars 조건 미달 레포가 섞여 올 수 있음
    mockGraphQL.mockResolvedValueOnce({
      search: {
        pageInfo: { hasNextPage: false, endCursor: null },
        nodes: [
          makeIssueNode('https://github.com/a/b/issues/1', 0),
          makeIssueNode('https://github.com/c/d/issues/2', MIN_CANDIDATE_REPO_STARS - 1),
          makeIssueNode('https://github.com/e/f/issues/3', MIN_CANDIDATE_REPO_STARS),
          makeIssueNode('https://github.com/g/h/issues/4', MIN_CANDIDATE_REPO_STARS + 100),
        ],
      },
    })

    const result = await fetchCandidateIssues(['TypeScript'], 'token')

    expect(result.issues).toHaveLength(2)
    expect(result.issues.every((i) => i.repository.stargazerCount >= MIN_CANDIDATE_REPO_STARS)).toBe(true)
  })

  it('afterCursors를 각 언어에 맞게 전달한다', async () => {
    mockGraphQL.mockResolvedValue(makeSearchPage([]))

    await fetchCandidateIssues(['TypeScript', 'Rust'], 'token', {
      TypeScript: 'ts-after',
      Rust: null,
    })

    expect(mockGraphQL).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({ after: 'ts-after' }),
      'token'
    )
    expect(mockGraphQL).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({ after: null }),
      'token'
    )
  })
})
