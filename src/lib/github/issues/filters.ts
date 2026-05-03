import { z } from 'zod'
import { SCORE_FILTER_THRESHOLDS } from '@/constants/scoring-rules'
import type { ScoreThreshold } from '@/constants/scoring-rules'
import type { IssueFilters, ScoredIssue } from '@/types/issue'

// URL 쿼리 파라미터는 임의 문자열 — 허용 목록 외 값은 null로 폴백
const difficultyLevelSchema = z.enum(['beginner', 'junior', 'mid', 'senior']).nullable().catch(null)
const contributionTypeSchema = z.enum(['doc', 'bug', 'feat', 'test', 'review']).nullable().catch(null)
// Set.has()는 number → ScoreThreshold 좁히기를 지원하지 않아 타입 단언이 최소 필요
const validScoreSet = new Set<number>(SCORE_FILTER_THRESHOLDS)
// Zod v4는 NaN을 invalid_type으로 취급해 'abc' 같은 비숫자 입력 시 예외를 던진다.
// .catch(0)으로 폴백 — 0은 SCORE_FILTER_THRESHOLDS에 없으므로 transform에서 null이 된다.
const minScoreSchema = z.coerce.number().catch(0).transform(
    (n): ScoreThreshold | null => validScoreSet.has(n) ? (n as ScoreThreshold) : null
)

export function parseIssueFilters(searchParams: URLSearchParams): IssueFilters {
    return {
        language: searchParams.get('language'),
        difficultyLevel: difficultyLevelSchema.parse(searchParams.get('difficultyLevel')),
        contributionType: contributionTypeSchema.parse(searchParams.get('contributionType')),
        minScore: minScoreSchema.parse(searchParams.get('minScore')),
    }
}

export function applyFilters(issues: ScoredIssue[], filters: IssueFilters): ScoredIssue[] {
    return issues.filter((issue) => {
        if (filters.language && issue.language !== filters.language) return false
        if (filters.difficultyLevel && issue.difficultyLevel !== filters.difficultyLevel) return false
        if (filters.contributionType && issue.contributionType !== filters.contributionType) return false
        return !(filters.minScore !== null && issue.score < filters.minScore);
    })
}
