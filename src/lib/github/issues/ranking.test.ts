import { describe, it, expect, vi, afterEach } from 'vitest'
import { rankIssues } from '@/lib/github/issues/ranking'
import { RANK_SCORE_THRESHOLD } from '@/constants/scoring-rules'
import type { RawIssue, ScoredIssue } from '@/types/issue'
import type { OnboardingProfile } from '@/lib/user/profile'

vi.mock('@/lib/github/issues/scorer', () => ({ scoreIssue: vi.fn() }))

import { scoreIssue } from '@/lib/github/issues/scorer'
const mockScore = vi.mocked(scoreIssue)

afterEach(() => vi.clearAllMocks())

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
        score: 70,
        difficultyLevel: null,
        contributionType: null,
        competitionLevel: 'OPEN',
        hasPR: false,
        ...overrides,
    }
}

const profile: OnboardingProfile = {
    topLanguages: ['TypeScript'],
    experienceLevel: 'mid',
    contributionTypes: ['bug'],
    weeklyHours: 10,
    purpose: 'growth',
}

describe('rankIssues — 기본 동작', () => {
    it('rawIssues가 없으면 빈 배열을 반환한다', () => {
        const result = rankIssues([], profile, 'seed')
        expect(result).toHaveLength(0)
        expect(mockScore).not.toHaveBeenCalled()
    })

    it('점수가 높은 이슈가 앞에 위치한다', () => {
        const raw1 = makeRawIssue({ number: 1 })
        const raw2 = makeRawIssue({ number: 2 })
        mockScore
            .mockReturnValueOnce(makeScoredIssue({ number: 1, url: 'https://url/1', score: 50 }))
            .mockReturnValueOnce(makeScoredIssue({ number: 2, url: 'https://url/2', score: 90 }))

        const result = rankIssues([raw1, raw2], profile, 'seed')

        expect(result[0].number).toBe(2)
        expect(result[1].number).toBe(1)
    })

    it('동일 seed와 동일 입력은 항상 같은 순서를 반환한다', () => {
        const raws = [1, 2, 3].map((n) => makeRawIssue({ number: n }))
        const scored = [1, 2, 3].map((n) =>
            makeScoredIssue({ number: n, url: `https://url/${n}`, score: 70 })
        )

        mockScore
            .mockReturnValueOnce(scored[0])
            .mockReturnValueOnce(scored[1])
            .mockReturnValueOnce(scored[2])
        const first = rankIssues(raws, profile, 'fixed-seed').map((i) => i.number)

        mockScore
            .mockReturnValueOnce(scored[0])
            .mockReturnValueOnce(scored[1])
            .mockReturnValueOnce(scored[2])
        const second = rankIssues(raws, profile, 'fixed-seed').map((i) => i.number)

        // 동일 seed → 동일 순서(페이지네이션 안정성)
        expect(first).toEqual(second)
    })
})

describe('rankIssues — 최소 점수 필터', () => {
    it('RANK_SCORE_THRESHOLD 미만인 이슈는 결과에서 제외된다', () => {
        mockScore
            .mockReturnValueOnce(makeScoredIssue({ number: 1, url: 'https://url/1', score: RANK_SCORE_THRESHOLD - 1 }))
            .mockReturnValueOnce(makeScoredIssue({ number: 2, url: 'https://url/2', score: RANK_SCORE_THRESHOLD }))

        const result = rankIssues([makeRawIssue({ number: 1 }), makeRawIssue({ number: 2 })], profile, 'seed')

        expect(result).toHaveLength(1)
        expect(result[0].number).toBe(2)
    })

    it('RANK_SCORE_THRESHOLD와 정확히 같은 점수는 통과한다', () => {
        mockScore.mockReturnValue(makeScoredIssue({ score: RANK_SCORE_THRESHOLD }))

        const result = rankIssues([makeRawIssue()], profile, 'seed')

        expect(result).toHaveLength(1)
    })

    it('모든 이슈가 임계값 미만이면 빈 배열을 반환한다', () => {
        mockScore.mockReturnValue(makeScoredIssue({ score: RANK_SCORE_THRESHOLD - 1 }))

        const result = rankIssues([makeRawIssue(), makeRawIssue({ number: 2 })], profile, 'seed')

        expect(result).toHaveLength(0)
    })
})

describe('rankIssues — contributionType 점수 반영', () => {
    it('weeklyHours=2여도 feat 이슈가 제외되지 않고 결과에 포함된다', () => {
        // 기여 방식 필터는 제거됨 — 시간에 맞지 않는 방식도 점수로만 반영
        const rawBug  = makeRawIssue({ number: 1 })
        const rawFeat = makeRawIssue({ number: 2 })
        mockScore
            .mockReturnValueOnce(makeScoredIssue({ number: 1, url: 'https://url/1', contributionType: 'bug' }))
            .mockReturnValueOnce(makeScoredIssue({ number: 2, url: 'https://url/2', contributionType: 'feat' }))

        const result = rankIssues([rawBug, rawFeat], { ...profile, weeklyHours: 2 }, 'seed')

        expect(result).toHaveLength(2)
    })

    it('contributionType이 null인 이슈도 결과에 포함된다', () => {
        // 기여 방식이 감지되지 않은 이슈는 어떤 weeklyHours에서도 제외하지 않는다
        mockScore.mockReturnValue(makeScoredIssue({ contributionType: null }))

        const result = rankIssues([makeRawIssue()], { ...profile, weeklyHours: 2 }, 'seed')

        expect(result).toHaveLength(1)
    })
})
