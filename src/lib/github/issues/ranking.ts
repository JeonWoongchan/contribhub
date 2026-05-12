import { RANK_SCORE_THRESHOLD } from '@/constants/scoring-rules'
import { scoreIssue } from '@/lib/github/issues/scorer'
import type { RawIssue, ScoredIssue } from '@/types/issue'
import type { OnboardingProfile } from '@/lib/user/profile'

// 이슈 채점 → 임계값 미만 필터링 (GitHub API 반환 순서 유지)
export function rankIssues(
  rawIssues: RawIssue[],
  profile: OnboardingProfile,
): ScoredIssue[] {
  return rawIssues
    .map((rawIssue) => scoreIssue(rawIssue, profile))
    .filter((issue) => issue.score >= RANK_SCORE_THRESHOLD)
}
