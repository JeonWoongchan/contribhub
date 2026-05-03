// filters.test.ts
// parseIssueFilters()와 applyFilters()를 검증하는 단위 테스트 파일.
//
// 왜 이 파일이 필요한가?
//   URL 쿼리 파라미터 파싱은 입력이 임의 문자열이라 경계값 처리가 중요하다.
//   허용 목록 외 값이 들어왔을 때 null로 폴백하는지,
//   applyFilters가 AND 조건으로 복합 필터를 적용하는지를 검증한다.

import { describe, it, expect } from 'vitest'
import { parseIssueFilters, applyFilters } from '@/lib/github/issues/filters'
import { SCORE_FILTER_THRESHOLDS } from '@/constants/scoring-rules'
import type { ScoredIssue } from '@/types/issue'

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
        healthScore: null,
        ...overrides,
    }
}

// ─── parseIssueFilters ──────────────────────────────────────────────────────
// URLSearchParams: URL의 쿼리 파라미터(?key=value)를 다루는 Web 표준 API.
// new URLSearchParams('language=TypeScript') → language 파라미터를 'TypeScript'로 갖는 객체
describe('parseIssueFilters', () => {

    it('파라미터가 없으면 모든 필드가 null이다', () => {
        const params = new URLSearchParams()
        const filters = parseIssueFilters(params)

        // 빈 파라미터는 "필터 없음" 상태여야 한다
        expect(filters.language).toBeNull()
        expect(filters.difficultyLevel).toBeNull()
        expect(filters.contributionType).toBeNull()
        expect(filters.minScore).toBeNull()
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
})

// ─── applyFilters ───────────────────────────────────────────────────────────
describe('applyFilters', () => {
    // 모든 필터가 null인 "필터 없음" 상태를 편하게 만드는 상수
    const noFilters = {
        language: null,
        difficultyLevel: null,
        contributionType: null,
        minScore: null,
    } as const

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

    it('빈 이슈 배열은 빈 배열을 반환한다', () => {
        expect(applyFilters([], { ...noFilters, language: 'TypeScript' })).toHaveLength(0)
    })
})
