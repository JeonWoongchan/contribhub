import sql from '@/lib/db'
import { githubGraphQL } from '@/lib/github/client'
import { REPO_HEALTH_WEIGHTS, HEALTH_THRESHOLD } from '@/constants/scoring-rules'

interface MergedPR {
  createdAt: string
  mergedAt: string
}

interface ClosedPR {
  createdAt: string
  closedAt: string
}

interface RepoHealthData {
  repository: {
    pushedAt: string
    mergedPullRequests: {
      nodes: MergedPR[]
    }
    closedPullRequests: {
      nodes: ClosedPR[]
    }
    issues: {
      nodes: {
        comments: {
          nodes: {
            authorAssociation: string
          }[]
        }
      }[]
    }
  }
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

// 최근 커밋 기준 점수 계산
function scoreRecentCommit(pushedAt: string): number {
  const daysSince = (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24)

  for (const rule of REPO_HEALTH_WEIGHTS.RECENT_COMMIT.rules) {
    if (daysSince <= rule.days) return rule.score
  }
  return 0
}

// PR 평균 응답 속도 점수 계산 — 머지된 PR 기준 생성 → 머지 기간
function scorePRResponseSpeed(mergedPRs: MergedPR[]): number {
  if (mergedPRs.length === 0) return 0

  const avgDays =
    mergedPRs.reduce((sum, pr) => {
      const end = new Date(pr.mergedAt).getTime()
      const start = new Date(pr.createdAt).getTime()
      return sum + (end - start) / (1000 * 60 * 60 * 24)
    }, 0) / mergedPRs.length

  for (const rule of REPO_HEALTH_WEIGHTS.PR_RESPONSE_SPEED.rules) {
    if (avgDays <= rule.days) return rule.score
  }
  return 0
}

// PR 머지율 점수 계산 — 머지된 PR / (머지 + 클로즈된 PR)
function scoreMergeRate(mergedPRs: MergedPR[], closedPRs: ClosedPR[]): number {
  const total = mergedPRs.length + closedPRs.length
  if (total === 0) return 0

  const rate = mergedPRs.length / total

  if (rate >= 0.8) return REPO_HEALTH_WEIGHTS.MERGE_RATE.rules[0].score
  if (rate >= 0.6) return REPO_HEALTH_WEIGHTS.MERGE_RATE.rules[1].score
  if (rate >= 0.4) return REPO_HEALTH_WEIGHTS.MERGE_RATE.rules[2].score
  return 0
}

// 메인테이너 응답 비율 점수 계산
function scoreMaintainerResponse(
  issues: RepoHealthData['repository']['issues']['nodes']
): number {
  if (issues.length === 0) return 0

  const maintainerAssociations = new Set(['MEMBER', 'OWNER', 'COLLABORATOR'])
  const respondedCount = issues.filter((issue) =>
    issue.comments.nodes.some((c) => maintainerAssociations.has(c.authorAssociation))
  ).length

  const ratio = respondedCount / issues.length

  if (ratio >= 0.7) return REPO_HEALTH_WEIGHTS.MAINTAINER_RESPONSE.rules[0].score
  if (ratio >= 0.4) return REPO_HEALTH_WEIGHTS.MAINTAINER_RESPONSE.rules[1].score
  if (ratio > 0)   return 4  // 일부라도 메인테이너 응답 있으면 소폭 점수
  return 0
}

// 레포 활성도 점수 계산 (0~100)
function calculateHealthScore(data: RepoHealthData): number {
  const { repository } = data

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
  // 1. 캐시 확인 (1시간 이내)
  const cached = await sql`
    SELECT health_score
    FROM repo_health_cache
    WHERE repo_full_name = ${repoFullName}
      AND cached_at > NOW() - INTERVAL '1 hour'
  `
  if (cached.length > 0) return cached[0].health_score

  // 2. GitHub API 호출
  const [owner, name] = repoFullName.split('/')
  const data = await githubGraphQL<RepoHealthData>(
    REPO_HEALTH_QUERY,
    { owner, name },
    accessToken
  )

  const healthScore = calculateHealthScore(data)

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
