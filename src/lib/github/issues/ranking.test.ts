import { describe, it, expect, vi, afterEach } from 'vitest'
import { rankIssues } from '@/lib/github/issues/ranking'
import { HEALTH_THRESHOLD } from '@/constants/scoring-rules'
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
        healthScore: 80,
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
        const result = rankIssues([], profile, new Map(), 'seed')
        expect(result).toHaveLength(0)
        expect(mockScore).not.toHaveBeenCalled()
    })

    it('점수가 높은 이슈가 앞에 위치한다', () => {
        const raw1 = makeRawIssue({ number: 1 })
        const raw2 = makeRawIssue({ number: 2 })
        mockScore
            .mockReturnValueOnce(makeScoredIssue({ number: 1, url: 'https://url/1', score: 50 }))
            .mockReturnValueOnce(makeScoredIssue({ number: 2, url: 'https://url/2', score: 90 }))

        const result = rankIssues([raw1, raw2], profile, new Map(), 'seed')

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
        const first = rankIssues(raws, profile, new Map(), 'fixed-seed').map((i) => i.number)

        mockScore
            .mockReturnValueOnce(scored[0])
            .mockReturnValueOnce(scored[1])
            .mockReturnValueOnce(scored[2])
        const second = rankIssues(raws, profile, new Map(), 'fixed-seed').map((i) => i.number)

        // 동일 seed → 동일 순서(페이지네이션 안정성)
        expect(first).toEqual(second)
    })
})

describe('rankIssues — health 필터', () => {
    it('healthScore < HEALTH_THRESHOLD인 이슈는 결과에서 제외된다', () => {
        mockScore.mockReturnValue(makeScoredIssue({ healthScore: HEALTH_THRESHOLD - 1 }))

        const result = rankIssues([makeRawIssue()], profile, new Map(), 'seed')

        expect(result).toHaveLength(0)
    })

    it('healthScore === HEALTH_THRESHOLD인 이슈는 통과한다', () => {
        mockScore.mockReturnValue(makeScoredIssue({ healthScore: HEALTH_THRESHOLD }))

        const result = rankIssues([makeRawIssue()], profile, new Map(), 'seed')

        expect(result).toHaveLength(1)
    })

    it('healthScore가 null인 이슈는 health 필터를 통과한다', () => {
        // null은 "정보 없음" — 저활성 레포로 단정하지 않고 포함
        mockScore.mockReturnValue(makeScoredIssue({ healthScore: null }))

        const result = rankIssues([makeRawIssue()], profile, new Map(), 'seed')

        expect(result).toHaveLength(1)
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

        const result = rankIssues([rawBug, rawFeat], { ...profile, weeklyHours: 2 }, new Map(), 'seed')

        expect(result).toHaveLength(2)
    })

    it('contributionType이 null인 이슈도 결과에 포함된다', () => {
        // 기여 방식이 감지되지 않은 이슈는 어떤 weeklyHours에서도 제외하지 않는다
        mockScore.mockReturnValue(makeScoredIssue({ contributionType: null }))

        const result = rankIssues([makeRawIssue()], { ...profile, weeklyHours: 2 }, new Map(), 'seed')

        expect(result).toHaveLength(1)
    })
})

describe('rankIssues — healthMap 전달', () => {
    it('healthMap에 있는 레포는 해당 점수를 scoreIssue에 전달한다', () => {
        const raw = makeRawIssue({
            repository: {
                nameWithOwner: 'org/repo',
                url: 'https://github.com/org/repo',
                primaryLanguage: null,
                stargazerCount: 0,
            },
        })
        const healthMap = new Map([['org/repo', 85]])
        mockScore.mockReturnValue(makeScoredIssue())

        rankIssues([raw], profile, healthMap, 'seed')

        expect(mockScore).toHaveBeenCalledWith(raw, profile, 85)
    })

    it('healthMap에 없는 레포는 healthScore=null로 scoreIssue를 호출한다', () => {
        mockScore.mockReturnValue(makeScoredIssue())

        rankIssues([makeRawIssue()], profile, new Map(), 'seed')

        expect(mockScore).toHaveBeenCalledWith(expect.anything(), profile, null)
    })
})
