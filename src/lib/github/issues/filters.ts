import { z } from 'zod'
import { SCORE_FILTER_THRESHOLDS, STAR_FILTER_THRESHOLDS } from '@/constants/scoring-rules'
import type { ContributionType } from '@/types/user'
import type { CompetitionLevel, IssueFilters, ScoredIssue } from '@/types/issue'

// URL 쿼리 파라미터는 임의 문자열 — 허용 목록 외 값은 null로 폴백
const difficultyLevelSchema = z.enum(['beginner', 'junior', 'mid', 'senior']).nullable().catch(null)

// Zod v4는 NaN을 invalid_type으로 취급해 'abc' 같은 비숫자 입력 시 예외를 던진다.
// .catch(0)으로 폴백 — 0은 어느 허용 목록에도 없으므로 transform에서 null이 된다.
// Set.has()는 number → T 좁히기를 지원하지 않아 타입 단언이 최소 필요
function makeThresholdSchema<T extends number>(thresholds: readonly T[]) {
    const validSet = new Set<number>(thresholds)
    return z.coerce.number().catch(0).transform(
        (n): T | null => validSet.has(n) ? (n as T) : null
    )
}

const minScoreSchema = makeThresholdSchema(SCORE_FILTER_THRESHOLDS)
const minStarsSchema = makeThresholdSchema(STAR_FILTER_THRESHOLDS)

// 기여 방식 허용 목록 — 목록 외 값은 파싱 시 제거된다.
const VALID_CONTRIBUTION_TYPES = new Set<string>(['doc', 'bug', 'feat', 'test', 'review'])

// 경쟁도 허용 목록 — 목록 외 값은 파싱 시 제거된다.
const VALID_COMPETITION_LEVELS = new Set<string>(['OPEN', 'ACTIVE', 'HAS_PR'])

export function parseIssueFilters(searchParams: URLSearchParams): IssueFilters {
    const contributionTypes = searchParams
        .getAll('contributionTypes')
        .filter((v): v is ContributionType => VALID_CONTRIBUTION_TYPES.has(v))

    const competitionLevels = searchParams
        .getAll('competitionLevels')
        .filter((v): v is CompetitionLevel => VALID_COMPETITION_LEVELS.has(v))

    return {
        language: searchParams.get('language'),
        difficultyLevel: difficultyLevelSchema.parse(searchParams.get('difficultyLevel')),
        contributionTypes,
        competitionLevels,
        minScore: minScoreSchema.parse(searchParams.get('minScore')),
        minStars: minStarsSchema.parse(searchParams.get('minStars')),
    }
}

export function hasActiveFilters(filters: IssueFilters): boolean {
    return Boolean(
        filters.language ||
        filters.difficultyLevel ||
        filters.contributionTypes.length > 0 ||
        filters.competitionLevels.length > 0 ||
        filters.minScore !== null ||
        filters.minStars !== null
    )
}

export function applyFilters(issues: ScoredIssue[], filters: IssueFilters): ScoredIssue[] {
    return issues.filter((issue) => {
        if (filters.language && issue.language !== filters.language) return false
        if (filters.difficultyLevel && issue.difficultyLevel !== filters.difficultyLevel) return false
        // 기여 방식은 복수 선택 — 선택된 타입 중 하나라도 일치하면 통과, contributionType이 null인 이슈는 제외
        if (filters.contributionTypes.length > 0 &&
            (!issue.contributionType || !filters.contributionTypes.includes(issue.contributionType))) return false
        // 경쟁도는 복수 선택 — 선택된 레벨 중 하나라도 일치하면 통과
        if (filters.competitionLevels.length > 0 &&
            !filters.competitionLevels.includes(issue.competitionLevel)) return false
        if (filters.minScore !== null && issue.score < filters.minScore) return false
        return !(filters.minStars !== null && issue.stargazerCount < filters.minStars);

    })
}
