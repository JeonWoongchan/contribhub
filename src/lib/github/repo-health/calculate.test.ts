import { describe, it, expect, vi, afterEach } from 'vitest'
import { getRepoHealth } from '@/lib/github/repo-health/calculate'
import { GitHubNotFoundError } from '@/lib/github/client'

vi.mock('@/lib/db', () => ({ default: vi.fn() }))
vi.mock('@/lib/github/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/github/client')>()
  return { ...actual, githubGraphQL: vi.fn() }
})

import db from '@/lib/db'
import { githubGraphQL } from '@/lib/github/client'
const mockDb = vi.mocked(db)
const mockGraphQL = vi.mocked(githubGraphQL)

afterEach(() => vi.clearAllMocks())

// ─── 날짜 헬퍼 ──────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

function makePR(mergeDelayDays: number) {
  return { createdAt: daysAgo(mergeDelayDays + 1), mergedAt: daysAgo(1) }
}

function makeClosedPR() {
  return { createdAt: daysAgo(5), closedAt: daysAgo(1) }
}

function makeIssueWithComment(authorAssociation: string) {
  return { comments: { nodes: [{ authorAssociation }] } }
}

function makeIssueNoComment() {
  return { comments: { nodes: [] } }
}

// ─── DB 캐시 동작 ────────────────────────────────────────────────────────────

describe('getRepoHealth — DB 캐시', () => {
  it('캐시 히트 시 GitHub API 호출 없이 저장된 점수를 반환한다', async () => {
    mockDb.mockResolvedValueOnce([{ health_score: 75 }])

    const score = await getRepoHealth('owner/repo', 'token')

    expect(score).toBe(75)
    expect(mockGraphQL).not.toHaveBeenCalled()
  })

  it('캐시 미스 시 GitHub API를 호출하고 점수를 저장한다', async () => {
    mockDb.mockResolvedValueOnce([])   // SELECT (캐시 미스)
    mockDb.mockResolvedValueOnce([])   // INSERT

    const repo = {
      pushedAt: daysAgo(10),
      mergedPullRequests: { nodes: [makePR(1)] },
      closedPullRequests: { nodes: [] },
      issues: { nodes: [makeIssueWithComment('OWNER')] },
    }
    mockGraphQL.mockResolvedValueOnce({ repository: repo })

    await getRepoHealth('owner/repo', 'token')

    expect(mockGraphQL).toHaveBeenCalledOnce()
    expect(mockDb).toHaveBeenCalledTimes(2)
  })

  it('repository가 null이면 GitHubNotFoundError를 던진다', async () => {
    mockDb.mockResolvedValueOnce([])
    mockGraphQL.mockResolvedValueOnce({ repository: null })

    await expect(getRepoHealth('owner/nonexistent', 'token')).rejects.toBeInstanceOf(GitHubNotFoundError)
  })
})

// ─── 점수 계산 ──────────────────────────────────────────────────────────────
// 점수 계산은 getRepoHealth를 통해 검증한다 (내부 함수는 비공개)

describe('getRepoHealth — 점수 계산', () => {
  async function computeScore(repoOverrides: object): Promise<number> {
    mockDb.mockResolvedValueOnce([])
    mockDb.mockResolvedValueOnce([])
    mockGraphQL.mockResolvedValueOnce({ repository: repoOverrides })
    return getRepoHealth('owner/repo', 'token')
  }

  it('활성 레포(최근 커밋, 빠른 PR, 높은 머지율, 메인테이너 응답)는 100점이다', async () => {
    const repo = {
      pushedAt: daysAgo(10),                                     // <= 30일 → 30점
      mergedPullRequests: { nodes: [makePR(1), makePR(1)] },     // 1일 평균 → 30점
      closedPullRequests: { nodes: [] },                         // 2merged/2total = 100% >= 0.8 → 25점
      issues: {
        nodes: [
          makeIssueWithComment('OWNER'),
          makeIssueWithComment('MEMBER'),
          makeIssueWithComment('COLLABORATOR'),
          makeIssueWithComment('OWNER'),
        ],
      },                                                         // 4/4 = 100% >= 0.7 → 15점
    }

    expect(await computeScore(repo)).toBe(100)
  })

  it('비활성 레포(오래된 커밋, PR/이슈 없음)는 0점이다', async () => {
    const repo = {
      pushedAt: daysAgo(200),                           // > 180일 → 0점
      mergedPullRequests: { nodes: [] },                // 없음 → 0점
      closedPullRequests: { nodes: [] },                // total=0 → 0점
      issues: { nodes: [] },                            // 없음 → 0점
    }

    expect(await computeScore(repo)).toBe(0)
  })

  it('중간 활성도 레포는 부분 점수를 반환한다', async () => {
    // 60일 경과 → 20점 (30 < 60 <= 90)
    // 5일 평균 PR 머지 → 20점 (3 < 5 <= 7)
    // 6merged / (6+4) = 60% → 15점 (>= 0.6)
    // 5/10 이슈 메인테이너 응답 → 8점 (0.4 <= 0.5 < 0.7)
    // 합계: 63점
    const mergedPRs = Array.from({ length: 6 }, () => makePR(5))
    const closedPRs = Array.from({ length: 4 }, () => makeClosedPR())
    const issues = [
      ...Array.from({ length: 5 }, () => makeIssueWithComment('MEMBER')),
      ...Array.from({ length: 5 }, () => makeIssueNoComment()),
    ]

    const repo = {
      pushedAt: daysAgo(60),
      mergedPullRequests: { nodes: mergedPRs },
      closedPullRequests: { nodes: closedPRs },
      issues: { nodes: issues },
    }

    expect(await computeScore(repo)).toBe(63)
  })

  it('최근 커밋 기준: 29일은 30점, 31일은 20점 (임계값 30일 경계)', async () => {
    // RECENT_COMMIT 규칙: <= 30일 → 30점, <= 90일 → 20점
    // PR/이슈 없음으로 다른 차원을 0으로 격리
    const base = {
      mergedPullRequests: { nodes: [] },
      closedPullRequests: { nodes: [] },
      issues: { nodes: [] },
    }

    const score29 = await computeScore({ ...base, pushedAt: daysAgo(29) })
    const score31 = await computeScore({ ...base, pushedAt: daysAgo(31) })

    expect(score29).toBe(30)  // 29 <= 30 → 30점
    expect(score31).toBe(20)  // 31 > 30, 31 <= 90 → 20점
  })

  it('최근 커밋 기준: 89일은 20점, 91일은 10점 (임계값 90일 경계)', async () => {
    const base = {
      mergedPullRequests: { nodes: [] },
      closedPullRequests: { nodes: [] },
      issues: { nodes: [] },
    }

    const score89 = await computeScore({ ...base, pushedAt: daysAgo(89) })
    const score91 = await computeScore({ ...base, pushedAt: daysAgo(91) })

    expect(score89).toBe(20)  // 89 <= 90 → 20점
    expect(score91).toBe(10)  // 91 > 90, 91 <= 180 → 10점
  })

  it('최근 커밋 기준: 179일은 10점, 181일은 0점 (임계값 180일 경계)', async () => {
    const base = {
      mergedPullRequests: { nodes: [] },
      closedPullRequests: { nodes: [] },
      issues: { nodes: [] },
    }

    const score179 = await computeScore({ ...base, pushedAt: daysAgo(179) })
    const score181 = await computeScore({ ...base, pushedAt: daysAgo(181) })

    expect(score179).toBe(10)  // 179 <= 180 → 10점
    expect(score181).toBe(0)   // 181 > 180, Infinity rule → 0점
  })

  it('머지율 80%는 25점, 75%는 15점 (임계값 0.8 경계)', async () => {
    // 4/(4+1) = 0.8, 3/(3+1) = 0.75 — pushedAt을 충분히 오래 전으로 설정해 RECENT_COMMIT=0
    const base = { pushedAt: daysAgo(500), issues: { nodes: [] } }

    const score80 = await computeScore({
      ...base,
      mergedPullRequests: { nodes: Array.from({ length: 4 }, () => makePR(1)) },
      closedPullRequests: { nodes: [makeClosedPR()] },
    })
    const score75 = await computeScore({
      ...base,
      mergedPullRequests: { nodes: Array.from({ length: 3 }, () => makePR(1)) },
      closedPullRequests: { nodes: [makeClosedPR()] },
    })

    expect(score80).toBeGreaterThan(score75)
    // 머지율 0.8 → MERGE_RATE 25점, 빠른 PR 1일 → PR_RESPONSE_SPEED 30점
    expect(score80).toBe(0 + 30 + 25 + 0)  // RECENT_COMMIT=0, PR_SPEED=30, MERGE=25, MAINTAINER=0
    // 머지율 0.75 → MERGE_RATE 15점
    expect(score75).toBe(0 + 30 + 15 + 0)
  })

  it('메인테이너가 아닌 댓글만 있는 이슈는 응답률 0%로 낮은 점수를 준다', async () => {
    const repo = {
      pushedAt: daysAgo(10),
      mergedPullRequests: { nodes: [] },
      closedPullRequests: { nodes: [] },
      issues: {
        nodes: [
          makeIssueWithComment('NONE'),
          makeIssueWithComment('CONTRIBUTOR'),
        ],
      },
    }
    // 응답률 0% → gte 모드에서 0 >= 0 → 4점
    const score = await computeScore(repo)
    expect(score).toBe(30 + 0 + 0 + 4)
  })
})
