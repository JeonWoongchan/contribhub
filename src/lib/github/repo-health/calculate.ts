import sql from '@/lib/db'
import {githubGraphQL, GitHubNotFoundError} from '@/lib/github/client'
import { REPO_HEALTH_WEIGHTS, HEALTH_THRESHOLD, REPO_HEALTH_CACHE_TTL_HOURS } from '@/constants/scoring-rules'

interface MergedPR {
  createdAt: string
  mergedAt: string
}

interface ClosedPR {
  createdAt: string
  closedAt: string
}

export interface RepoRepository {
  pushedAt: string
  mergedPullRequests: { nodes: MergedPR[] }
  closedPullRequests: { nodes: ClosedPR[] }
  issues: {
    nodes: {
      comments: {
        nodes: { authorAssociation: string }[]
      }
    }[]
  }
}

interface RepoHealthData {
  repository: RepoRepository | null  // 존재하지 않는 레포 또는 권한 없는 레포
}

const REPO_HEALTH_QUERY = `
  query RepoHealth($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      pushedAt
      mergedPullRequests: pullRequests(last: 20, states: [MERGED]) {
        nodes {
          createdAt
          mergedAt
        }
      }
      closedPullRequests: pullRequests(last: 20, states: [CLOSED]) {
        nodes {
          createdAt
          closedAt
        }
      }
      issues(last: 10, states: [OPEN, CLOSED]) {
        nodes {
          comments(first: 5) {
            nodes {
              authorAssociation
            }
          }
        }
      }
    }
  }
`

// 임계값 기준 점수 반환 — 제네릭으로 rule 타입 추론, as 캐스팅 없음
// lte: value <= threshold (낮을수록 좋음 — 커밋 날짜, PR 응답 속도)
// gte: value >= threshold (높을수록 좋음 — 머지율, 메인테이너 응답률)
function scoreByThreshold<T extends { score: number }>(
  value: number,
  rules: readonly T[],
  getThreshold: (rule: T) => number,
  mode: 'lte' | 'gte'
): number {
  for (const rule of rules) {
    const threshold = getThreshold(rule)
    if (mode === 'lte' ? value <= threshold : value >= threshold) {
      return rule.score
    }
  }
  return 0
}

// 최근 커밋 기준 점수 계산
function scoreRecentCommit(pushedAt: string): number {
  const daysSince = (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24)
  return scoreByThreshold(daysSince, REPO_HEALTH_WEIGHTS.RECENT_COMMIT.rules, (r) => r.days, 'lte')
}

// PR 평균 응답 속도 점수 계산 — 머지된 PR 기준 생성 → 머지 기간
function scorePRResponseSpeed(mergedPRs: MergedPR[]): number {
  if (mergedPRs.length === 0) return 0

  const avgDays =
    mergedPRs.reduce((sum, pr) => {
      return sum + (new Date(pr.mergedAt).getTime() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    }, 0) / mergedPRs.length

  return scoreByThreshold(avgDays, REPO_HEALTH_WEIGHTS.PR_RESPONSE_SPEED.rules, (r) => r.days, 'lte')
}

// PR 머지율 점수 계산 — 머지된 PR / (머지 + 클로즈된 PR)
function scoreMergeRate(mergedPRs: MergedPR[], closedPRs: ClosedPR[]): number {
  const total = mergedPRs.length + closedPRs.length
  if (total === 0) return 0

  const rate = mergedPRs.length / total
  return scoreByThreshold(rate, REPO_HEALTH_WEIGHTS.MERGE_RATE.rules, (r) => r.rate, 'gte')
}

// 메인테이너 응답 비율 점수 계산
function scoreMaintainerResponse(issues: RepoRepository['issues']['nodes']): number {
  if (issues.length === 0) return 0

  const maintainerAssociations = new Set(['MEMBER', 'OWNER', 'COLLABORATOR'])
  const respondedCount = issues.filter((issue) =>
    issue.comments.nodes.some((c) => maintainerAssociations.has(c.authorAssociation))
  ).length

  const ratio = respondedCount / issues.length
  return scoreByThreshold(ratio, REPO_HEALTH_WEIGHTS.MAINTAINER_RESPONSE.rules, (r) => r.ratio, 'gte')
}

// 레포 활성도 점수 계산 (0~100)
function calculateHealthScore(repository: RepoRepository): number {
  return (
    scoreRecentCommit(repository.pushedAt) +
    scorePRResponseSpeed(repository.mergedPullRequests.nodes) +
    scoreMergeRate(repository.mergedPullRequests.nodes, repository.closedPullRequests.nodes) +
    scoreMaintainerResponse(repository.issues.nodes)
  )
}

// 레포 활성도 조회 — DB 캐시 우선, 없으면 GitHub API 호출 후 캐시 저장
export async function getRepoHealth(
  repoFullName: string,
  accessToken: string
): Promise<number> {
  // 1. 캐시 확인
  const cached = await sql`
    SELECT health_score
    FROM repo_health_cache
    WHERE repo_full_name = ${repoFullName}
      AND cached_at > NOW() - (${REPO_HEALTH_CACHE_TTL_HOURS} * INTERVAL '1 hour')
  `
  if (cached.length > 0) return cached[0].health_score

  // 2. GitHub API 호출
  const [owner, name] = repoFullName.split('/')
  const data = await githubGraphQL<RepoHealthData>(
    REPO_HEALTH_QUERY,
    { owner, name },
    accessToken
  )

  // repository가 null이면 존재하지 않는 레포 — NotFound 에러
  if (!data.repository) throw new GitHubNotFoundError()

  const healthScore = calculateHealthScore(data.repository)

  // 3. 캐시 저장
  await sql`
    INSERT INTO repo_health_cache (repo_full_name, health_score, cached_at)
    VALUES (${repoFullName}, ${healthScore}, NOW())
    ON CONFLICT (repo_full_name)
    DO UPDATE SET
      health_score = EXCLUDED.health_score,
      cached_at    = EXCLUDED.cached_at
  `

  return healthScore
}

export { HEALTH_THRESHOLD }
