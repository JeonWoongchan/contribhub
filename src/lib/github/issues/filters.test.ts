// filters.test.ts
// parseIssueFilters()와 applyFilters()를 검증하는 단위 테스트 파일.
//
// 왜 이 파일이 필요한가?
//   URL 쿼리 파라미터 파싱은 입력이 임의 문자열이라 경계값 처리가 중요하다.
//   허용 목록 외 값이 들어왔을 때 null로 폴백하는지,
//   applyFilters가 AND 조건으로 복합 필터를 적용하는지를 검증한다.

import { describe, it, expect } from 'vitest'
import { parseIssueFilters, applyFilters } from '@/lib/github/issues/filters'
import { SCORE_FILTER_THRESHOLDS, STAR_FILTER_THRESHOLDS } from '@/constants/scoring-rules'
import type { IssueFilters, ScoredIssue } from '@/types/issue'

// ─── Factory Function ───────────────────────────────────────────────────────
/** 테스트용 ScoredIssue 기본값 생성 함수. */
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
        difficultyLevel: 'junior',
        contributionType: 'bug',
        competitionLevel: 'OPEN',
        hasPR: false,
        repoActivityLevel: 'active',
        ...overrides,
    }
}

// ─── parseIssueFilters ──────────────────────────────────────────────────────
// URLSearchParams: URL의 쿼리 파라미터(?key=value)를 다루는 Web 표준 API.
// new URLSearchParams('language=TypeScript') → language 파라미터를 'TypeScript'로 갖는 객체
describe('parseIssueFilters', () => {

    it('파라미터가 없으면 language·difficultyLevel·minScore·minStars는 null, contributionTypes·competitionLevels는 빈 배열이다', () => {
        const params = new URLSearchParams()
        const filters = parseIssueFilters(params)

        // 빈 파라미터는 "필터 없음" 상태여야 한다
        expect(filters.language).toBeNull()
        expect(filters.difficultyLevel).toBeNull()
        expect(filters.contributionTypes).toEqual([])
        expect(filters.competitionLevels).toEqual([])
        expect(filters.minScore).toBeNull()
        expect(filters.minStars).toBeNull()
    })

    it('허용된 competitionLevels 값들은 배열로 반환된다', () => {
        const params = new URLSearchParams()
        params.append('competitionLevels', 'OPEN')
        params.append('competitionLevels', 'HAS_PR')
        const filters = parseIssueFilters(params)
        expect(filters.competitionLevels).toEqual(['OPEN', 'HAS_PR'])
    })

    it('허용되지 않은 competitionLevels 값은 제거된다', () => {
        const params = new URLSearchParams('competitionLevels=INVALID')
        expect(parseIssueFilters(params).competitionLevels).toEqual([])
    })

    it('허용된 contributionTypes 값들은 배열로 반환된다', () => {
        const params = new URLSearchParams()
        params.append('contributionTypes', 'bug')
        params.append('contributionTypes', 'doc')
        expect(parseIssueFilters(params).contributionTypes).toEqual(['bug', 'doc'])
    })

    it('허용되지 않은 contributionTypes 값("hack")은 제거된다', () => {
        const params = new URLSearchParams()
        params.append('contributionTypes', 'bug')
        params.append('contributionTypes', 'hack')
        expect(parseIssueFilters(params).contributionTypes).toEqual(['bug'])
    })

    it('language 파라미터는 그대로 반환된다', () => {
        const params = new URLSearchParams('language=TypeScript')
        expect(parseIssueFilters(params).language).toBe('TypeScript')
    })

    it('허용된 difficultyLevel("junior")은 그대로 반환된다', () => {
        const params = new URLSearchParams('difficultyLevel=junior')
        expect(parseIssueFilters(params).difficultyLevel).toBe('junior')
    })

    it('허용되지 않은 difficultyLevel("expert")은 null로 폴백한다', () => {
        // 'expert'는 ['beginner', 'junior', 'mid', 'senior'] 목록에 없다
        const params = new URLSearchParams('difficultyLevel=expert')
        expect(parseIssueFilters(params).difficultyLevel).toBeNull()
    })

    it('SCORE_FILTER_THRESHOLDS에 있는 minScore는 숫자로 반환된다', () => {
        // SCORE_FILTER_THRESHOLDS = [50, 60, 70, 80, 90]
        // 쿼리 파라미터는 항상 문자열로 전달되므로 숫자로 변환되어야 한다
        const threshold = SCORE_FILTER_THRESHOLDS[0]
        const params = new URLSearchParams(`minScore=${threshold}`)
        expect(parseIssueFilters(params).minScore).toBe(threshold)
    })

    it('허용 목록에 없는 minScore(55)는 null로 폴백한다', () => {
        // 55는 임의 숫자로, SCORE_FILTER_THRESHOLDS에 없는 값이다
        const params = new URLSearchParams('minScore=55')
        expect(parseIssueFilters(params).minScore).toBeNull()
    })

    it('숫자가 아닌 minScore("abc")는 null로 폴백한다', () => {
        const params = new URLSearchParams('minScore=abc')
        expect(parseIssueFilters(params).minScore).toBeNull()
    })

    it('STAR_FILTER_THRESHOLDS에 있는 minStars는 숫자로 반환된다', () => {
        const threshold = STAR_FILTER_THRESHOLDS[0]
        const params = new URLSearchParams(`minStars=${threshold}`)
        expect(parseIssueFilters(params).minStars).toBe(threshold)
    })

    it('허용 목록에 없는 minStars(200)는 null로 폴백한다', () => {
        const params = new URLSearchParams('minStars=200')
        expect(parseIssueFilters(params).minStars).toBeNull()
    })

    it('숫자가 아닌 minStars("abc")는 null로 폴백한다', () => {
        const params = new URLSearchParams('minStars=abc')
        expect(parseIssueFilters(params).minStars).toBeNull()
    })
})

// ─── applyFilters ───────────────────────────────────────────────────────────
describe('applyFilters', () => {
    // 모든 필터가 비어있는 "필터 없음" 상태를 편하게 만드는 상수
    const noFilters: IssueFilters = {
        language: null,
        difficultyLevel: null,
        contributionTypes: [],
        competitionLevels: [],
        minScore: null,
        minStars: null,
    }

    it('모든 필터가 null이면 이슈를 전부 통과시킨다', () => {
        const issues = [makeScoredIssue(), makeScoredIssue({ number: 2 })]
        // toHaveLength: 배열·문자열의 길이를 검사
        expect(applyFilters(issues, noFilters)).toHaveLength(2)
    })

    it('language 필터는 해당 언어의 이슈만 통과시킨다', () => {
        const issues = [
            makeScoredIssue({ language: 'TypeScript' }),
            makeScoredIssue({ number: 2, language: 'Python' }),
        ]
        const result = applyFilters(issues, { ...noFilters, language: 'TypeScript' })
        expect(result).toHaveLength(1)
        expect(result[0].language).toBe('TypeScript')
    })

    it('minScore 필터는 기준 점수 이상인 이슈만 통과시킨다', () => {
        const issues = [
            makeScoredIssue({ score: 80 }),
            makeScoredIssue({ number: 2, score: 50 }),
        ]
        const result = applyFilters(issues, { ...noFilters, minScore: 70 })
        expect(result).toHaveLength(1)
        expect(result[0].score).toBe(80)
    })

    it('minScore 기준값과 정확히 같은 점수의 이슈는 통과한다', () => {
        // 경계값(boundary): 70 기준일 때 정확히 70인 이슈가 포함되어야 한다
        const issue = makeScoredIssue({ score: 70 })
        const result = applyFilters([issue], { ...noFilters, minScore: 70 })
        expect(result).toHaveLength(1)
    })

    it('복합 필터는 AND 조건으로 적용된다', () => {
        // 조건: language=TypeScript AND minScore>=70
        const issues = [
            makeScoredIssue({ number: 1, language: 'TypeScript', score: 80 }), // 통과
            makeScoredIssue({ number: 2, language: 'TypeScript', score: 50 }), // score 미달
            makeScoredIssue({ number: 3, language: 'Python',     score: 90 }), // language 불일치
        ]
        const result = applyFilters(issues, { ...noFilters, language: 'TypeScript', minScore: 70 })
        expect(result).toHaveLength(1)
        expect(result[0].number).toBe(1)
    })

    it('contributionTypes 필터는 선택된 타입 중 하나라도 일치하는 이슈만 통과시킨다', () => {
        const issues = [
            makeScoredIssue({ number: 1, contributionType: 'bug' }),
            makeScoredIssue({ number: 2, contributionType: 'doc' }),
            makeScoredIssue({ number: 3, contributionType: 'feat' }),
        ]
        const result = applyFilters(issues, { ...noFilters, contributionTypes: ['bug', 'doc'] })
        expect(result).toHaveLength(2)
        expect(result.map((i) => i.number)).toEqual([1, 2])
    })

    it('contributionType이 null인 이슈는 contributionTypes 필터 적용 시 제외된다', () => {
        const issues = [
            makeScoredIssue({ number: 1, contributionType: 'bug' }),
            makeScoredIssue({ number: 2, contributionType: null }),
        ]
        const result = applyFilters(issues, { ...noFilters, contributionTypes: ['bug'] })
        expect(result).toHaveLength(1)
        expect(result[0].number).toBe(1)
    })

    it('contributionTypes가 빈 배열이면 모든 이슈를 통과시킨다', () => {
        const issues = [
            makeScoredIssue({ number: 1, contributionType: 'bug' }),
            makeScoredIssue({ number: 2, contributionType: null }),
        ]
        expect(applyFilters(issues, noFilters)).toHaveLength(2)
    })

    it('빈 이슈 배열은 빈 배열을 반환한다', () => {
        expect(applyFilters([], { ...noFilters, language: 'TypeScript' })).toHaveLength(0)
    })

    it('minScore 기준값보다 1점 낮은 이슈는 통과하지 못한다', () => {
        // 경계값 아래(threshold-1)가 제외되는지 검증 — 70점 기준일 때 69점은 탈락
        const issue = makeScoredIssue({ score: 69 })
        const result = applyFilters([issue], { ...noFilters, minScore: 70 })
        expect(result).toHaveLength(0)
    })

    it('language가 null인 이슈는 language 필터에서 제외된다', () => {
        // GitHub primaryLanguage가 없는 이슈는 language 필터 적용 시 탈락해야 한다
        const issues = [
            makeScoredIssue({ language: 'TypeScript' }),
            makeScoredIssue({ number: 2, language: null }),
        ]
        const result = applyFilters(issues, { ...noFilters, language: 'TypeScript' })
        expect(result).toHaveLength(1)
        expect(result[0].language).toBe('TypeScript')
    })

    it('높은 threshold(90)를 통과한 이슈는 낮은 threshold(50)에서도 통과한다', () => {
        // 90+ 필터 → 50+ 필터로 낮출 때 기존 목록이 유지되고 추가 이슈가 포함되어야 한다
        const issues = [
            makeScoredIssue({ number: 1, score: 95 }),
            makeScoredIssue({ number: 2, score: 90 }),
            makeScoredIssue({ number: 3, score: 55 }),
            makeScoredIssue({ number: 4, score: 45 }),
        ]
        const high = applyFilters(issues, { ...noFilters, minScore: 90 })
        const low  = applyFilters(issues, { ...noFilters, minScore: 50 })

        // 90+ 통과 이슈는 반드시 50+ 결과에도 포함된다(수퍼셋 성질)
        for (const issue of high) {
            expect(low.some((i) => i.number === issue.number)).toBe(true)
        }
        // 낮은 threshold는 같거나 더 많은 이슈를 포함한다
        expect(low.length).toBeGreaterThanOrEqual(high.length)
        // 45점짜리는 50+ 기준도 통과하지 못한다
        expect(low.some((i) => i.number === 4)).toBe(false)
    })

    it.each([...SCORE_FILTER_THRESHOLDS])(
        'SCORE_FILTER_THRESHOLDS %i: 기준값은 통과, 기준값-1은 탈락',
        (threshold) => {
            const atThreshold = makeScoredIssue({ number: 1, score: threshold })
            const below       = makeScoredIssue({ number: 2, score: threshold - 1 })
            const result = applyFilters([atThreshold, below], { ...noFilters, minScore: threshold })
            expect(result).toHaveLength(1)
            expect(result[0].number).toBe(1)
        }
    )

    it('minStars 필터는 기준 스타 수 이상인 이슈만 통과시킨다', () => {
        const issues = [
            makeScoredIssue({ number: 1, stargazerCount: 1000 }),
            makeScoredIssue({ number: 2, stargazerCount: 99 }),
        ]
        const result = applyFilters(issues, { ...noFilters, minStars: 100 })
        expect(result).toHaveLength(1)
        expect(result[0].number).toBe(1)
    })

    it('minStars 기준값과 정확히 같은 스타 수의 이슈는 통과한다', () => {
        const issue = makeScoredIssue({ stargazerCount: 300 })
        expect(applyFilters([issue], { ...noFilters, minStars: 300 })).toHaveLength(1)
    })

    it('minStars 기준값보다 1 낮은 이슈는 통과하지 못한다', () => {
        const issue = makeScoredIssue({ stargazerCount: 999 })
        expect(applyFilters([issue], { ...noFilters, minStars: 1000 })).toHaveLength(0)
    })

    it.each([...STAR_FILTER_THRESHOLDS])(
        'STAR_FILTER_THRESHOLDS %i: 기준값은 통과, 기준값-1은 탈락',
        (threshold) => {
            const atThreshold = makeScoredIssue({ number: 1, stargazerCount: threshold })
            const below       = makeScoredIssue({ number: 2, stargazerCount: threshold - 1 })
            const result = applyFilters([atThreshold, below], { ...noFilters, minStars: threshold })
            expect(result).toHaveLength(1)
            expect(result[0].number).toBe(1)
        }
    )

    it('competitionLevels 필터는 선택된 레벨 중 하나라도 일치하는 이슈만 통과시킨다', () => {
        const issues = [
            makeScoredIssue({ number: 1, competitionLevel: 'OPEN' }),
            makeScoredIssue({ number: 2, competitionLevel: 'ACTIVE' }),
            makeScoredIssue({ number: 3, competitionLevel: 'HAS_PR' }),
        ]
        const result = applyFilters(issues, { ...noFilters, competitionLevels: ['OPEN', 'ACTIVE'] })
        expect(result).toHaveLength(2)
        expect(result.map((i) => i.number)).toEqual([1, 2])
    })

    it('competitionLevels가 빈 배열이면 모든 이슈를 통과시킨다', () => {
        const issues = [
            makeScoredIssue({ number: 1, competitionLevel: 'OPEN' }),
            makeScoredIssue({ number: 2, competitionLevel: 'HAS_PR' }),
        ]
        expect(applyFilters(issues, noFilters)).toHaveLength(2)
    })
})
