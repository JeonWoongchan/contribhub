import { scoreIssue } from '@/lib/github/issues/scorer'
import type { RawIssue, ScoredIssue } from '@/types/issue'
import type { OnboardingProfile } from '@/lib/user/profile'

// FNV-1a 32비트 해시 — 배치 내 이슈 순서 고정용
function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

// 이슈 채점 → 점수 우선 정렬
export function rankIssues(
  rawIssues: RawIssue[],
  profile: OnboardingProfile,
  randomSeed: string
): ScoredIssue[] {
  // 해시를 sort 호출 전에 미리 계산해 비교자 내 중복 연산을 피한다
  return rawIssues
    .map((rawIssue) => {
      const issue = scoreIssue(rawIssue, profile)
      return { issue, hash: hashString(`${randomSeed}:${issue.url}`) }
    })
    // 점수 우선, 동점 시 배치 내 hash로 순서를 고정해 offset 기반 페이지네이션 안정성을 보장한다
    .sort((a, b) => {
      if (b.issue.score !== a.issue.score) return b.issue.score - a.issue.score
      return a.hash - b.hash
    })
    .map(({ issue }) => issue)
}
