import { HEALTH_THRESHOLD, TIME_FILTER } from '@/constants/scoring-rules'
import { scoreIssue } from '@/lib/github/issues/scorer'
import type { RawIssue, ScoredIssue } from '@/types/issue'
import type { ContributionType } from '@/types/user'
import type { OnboardingProfile } from '@/lib/user/profile'

// 온보딩 주간 작업 시간 기준 허용 기여 유형 목록 반환
function getAllowedContributionTypes(profile: OnboardingProfile): ContributionType[] {
  if (!profile.weeklyHours) return TIME_FILTER[10]
  return TIME_FILTER[profile.weeklyHours] ?? TIME_FILTER[10]
}

// 저장소 health 기준 미달 및 허용되지 않는 기여 유형 이슈 제거
function filterScoredIssues(
  issues: ScoredIssue[],
  allowedTypes: ContributionType[]
): ScoredIssue[] {
  return issues.filter((issue) => {
    if (issue.healthScore !== null && issue.healthScore < HEALTH_THRESHOLD) return false
    return !(issue.contributionType && !allowedTypes.includes(issue.contributionType))
  })
}

// FNV-1a 32비트 해시 — 배치 내 이슈 순서 고정용
function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

// 이슈 채점 → 필터링 → 점수 우선 정렬
export function rankIssues(
  rawIssues: RawIssue[],
  profile: OnboardingProfile,
  healthMap: Map<string, number>,
  randomSeed: string
): ScoredIssue[] {
  const allowedTypes = getAllowedContributionTypes(profile)

  return filterScoredIssues(
    rawIssues.map((rawIssue) => {
      const healthScore = healthMap.get(rawIssue.repository.nameWithOwner) ?? null
      return scoreIssue(rawIssue, profile, healthScore)
    }),
    allowedTypes
  )
    // 해시를 sort 호출 전에 미리 계산해 중복 연산을 피한다
    .map((issue) => ({ issue, hash: hashString(`${randomSeed}:${issue.url}`) }))
    // 점수 우선, 동점 시 배치 내 hash로 순서를 고정해 offset 기반 페이지네이션 안정성을 보장한다
    .sort((a, b) => {
      if (b.issue.score !== a.issue.score) return b.issue.score - a.issue.score
      return a.hash - b.hash
    })
    .map(({ issue }) => issue)
}
