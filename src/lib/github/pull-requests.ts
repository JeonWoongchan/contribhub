// GitHub GraphQL API를 통해 사용자의 PR 목록을 조회하고 가공하는 모듈

import { githubGraphQL } from '@/lib/github/client'
import { VIEWER_PULL_REQUESTS_QUERY } from '@/lib/github/queries'
import type {
  RawPullRequest,
  PullRequestItem,
  PullRequestState,
  PullRequestSummary,
} from '@/types/pull-request'

// GraphQL 응답의 최상위 구조 정의
interface ViewerPRsResult {
  viewer: {
    pullRequests: {
      totalCount: number
      pageInfo: {
        hasNextPage: boolean
        endCursor: string | null
      }
      nodes: RawPullRequest[]
    }
  }
}

// 본인 레포에 올린 PR 제외 — repoFullName은 "owner/repo" 형태
function excludeOwnRepoPRs(items: PullRequestItem[], viewerLogin: string): PullRequestItem[] {
  if (!viewerLogin) return items
  return items.filter((item) => item.repoFullName.split('/')[0] !== viewerLogin)
}

// GraphQL 원시 데이터를 클라이언트용 평탄 구조로 변환
function toPullRequestItem(raw: RawPullRequest): PullRequestItem {
  return {
    title: raw.title,
    url: raw.url,
    state: raw.state,
    createdAt: raw.createdAt,
    mergedAt: raw.mergedAt,
    closedAt: raw.closedAt,
    additions: raw.additions,
    deletions: raw.deletions,
    changedFiles: raw.changedFiles,
    commentCount: raw.comments.totalCount,
    reviewCount: raw.reviews.totalCount,
    commitCount: raw.commits.totalCount,
    labels: raw.labels.nodes.map((l) => l.name),
    repoFullName: raw.repository.nameWithOwner,
    repoUrl: raw.repository.url,
    stargazerCount: raw.repository.stargazerCount,
    language: raw.repository.primaryLanguage?.name ?? null,
  }
}

// 필터링된 전체 항목으로 요약 통계 계산
function computeSummary(items: PullRequestItem[]): PullRequestSummary {
  return {
    totalCount: items.length,
    mergedCount: items.filter((pr) => pr.state === 'MERGED').length,
    openCount: items.filter((pr) => pr.state === 'OPEN').length,
    closedCount: items.filter((pr) => pr.state === 'CLOSED').length,
    totalAdditions: items.reduce((sum, pr) => sum + pr.additions, 0),
    totalDeletions: items.reduce((sum, pr) => sum + pr.deletions, 0),
  }
}

async function fetchPullRequestPage(
  accessToken: string,
  after: string | null,
  states: PullRequestState[] | null,
): Promise<ViewerPRsResult['viewer']['pullRequests']> {
  const data = await githubGraphQL<ViewerPRsResult>(
    VIEWER_PULL_REQUESTS_QUERY,
    { first: 100, after, states },
    accessToken,
  )

  return data.viewer.pullRequests
}

export type FetchPullRequestsParams = {
  accessToken: string
  viewerLogin?: string
  states?: PullRequestState[] | null
}

export type FetchPullRequestsResult = {
  items: PullRequestItem[]
  summary: PullRequestSummary
}

// 전체 페이지를 순회하며 PR을 수집 → 필터링 → 통계 계산 후 반환
export async function fetchViewerPullRequests({
  accessToken,
  viewerLogin = '',
  states = null,
}: FetchPullRequestsParams): Promise<FetchPullRequestsResult> {
  let after: string | null = null
  let hasNextPage = true
  const allItems: PullRequestItem[] = []

  while (hasNextPage) {
    const connection = await fetchPullRequestPage(accessToken, after, states)
    allItems.push(...excludeOwnRepoPRs(connection.nodes.map(toPullRequestItem), viewerLogin))
    hasNextPage = connection.pageInfo.hasNextPage
    after = connection.pageInfo.endCursor
  }

  return {
    items: allItems,
    summary: computeSummary(allItems),
  }
}
