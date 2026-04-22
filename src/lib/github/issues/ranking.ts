import { HEALTH_THRESHOLD, STAR_CUTOFF, TIME_FILTER } from '@/constants/scoring-rules'
import { scoreIssue } from '@/lib/github/scorer'
import type { RawIssue, ScoredIssue } from '@/types/issue'
import type { ContributionType } from '@/types/user'
import type { OnboardingProfile } from '@/lib/user/profile'

function getAllowedContributionTypes(profile: OnboardingProfile): ContributionType[] {
  if (!profile.weeklyHours) return TIME_FILTER[10]
  return TIME_FILTER[profile.weeklyHours] ?? TIME_FILTER[10]
}

function filterScoredIssues(
  issues: ScoredIssue[],
  allowedTypes: ContributionType[]
): ScoredIssue[] {
  return issues.filter((issue) => {
    if (issue.stargazerCount < STAR_CUTOFF) return false
    if (issue.healthScore !== null && issue.healthScore < HEALTH_THRESHOLD) return false
    return !(issue.contributionType && !allowedTypes.includes(issue.contributionType));

  })
}

export function rankIssues(
  rawIssues: RawIssue[],
  profile: OnboardingProfile,
  healthMap: Map<string, number>
): ScoredIssue[] {
  const allowedTypes = getAllowedContributionTypes(profile)

  return filterScoredIssues(
    rawIssues.map((rawIssue) => {
      const healthScore = healthMap.get(rawIssue.repository.nameWithOwner) ?? null
      return scoreIssue(rawIssue, profile, healthScore)
    }),
    allowedTypes
  )
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
}
