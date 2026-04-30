import { CONTRIBUTION_TYPES, EXPERIENCE_LEVELS } from '@/constants/contribution-levels'
import { SCORE_FILTER_THRESHOLDS } from '@/constants/scoring-rules'
import type { IssueFilters, ScoredIssue } from '@/types/issue'

const VALID_DIFFICULTY_LEVELS = new Set<string>(EXPERIENCE_LEVELS.map((l) => l.value))
const VALID_CONTRIBUTION_TYPES = new Set<string>(CONTRIBUTION_TYPES.map((t) => t.value))
const VALID_SCORE_THRESHOLDS = new Set<number>(SCORE_FILTER_THRESHOLDS)

export function parseIssueFilters(searchParams: URLSearchParams): IssueFilters {
    const difficultyParam = searchParams.get('difficultyLevel')
    const contributionParam = searchParams.get('contributionType')
    const minScoreParam = Number(searchParams.get('minScore'))
    return {
        language: searchParams.get('language'),
        difficultyLevel: VALID_DIFFICULTY_LEVELS.has(difficultyParam ?? '') ? difficultyParam as IssueFilters['difficultyLevel'] : null,
        contributionType: VALID_CONTRIBUTION_TYPES.has(contributionParam ?? '') ? contributionParam as IssueFilters['contributionType'] : null,
        minScore: VALID_SCORE_THRESHOLDS.has(minScoreParam) ? minScoreParam as IssueFilters['minScore'] : null,
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
