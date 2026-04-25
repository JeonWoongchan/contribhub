// GitHub GraphQL API를 통해 사용자의 PR 목록을 조회하고 가공하는 모듈

import { githubGraphQL } from '@/lib/github/client'
import { VIEWER_PULL_REQUESTS_QUERY } from '@/lib/github/queries'
import type {
  RawPullRequest,
  PullRequestItem,
  PullRequestPageInfo,
  PullRequestState,
  PullRequestSummary,
} from '@/types/pull-request'

// GraphQL 응답의 최상위 구조 정의
interface ViewerPRsResult {
  viewer: {
    pullRequests: {
      totalCount: number
      pageInfo: PullRequestPageInfo
      nodes: RawPullRequest[]
    }
  }
}

// 1단계: GraphQL 원시 데이터를 클라이언트용 평탄 구조로 변환
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

// 2단계: 현재 로드된 PR 항목으로 요약 통계 계산
function computeSummary(items: PullRequestItem[], totalCount: number): PullRequestSummary {
  return {
    totalCount,
    mergedCount: items.filter((pr) => pr.state === 'MERGED').length,
    openCount: items.filter((pr) => pr.state === 'OPEN').length,
    closedCount: items.filter((pr) => pr.state === 'CLOSED').length,
    totalAdditions: items.reduce((sum, pr) => sum + pr.additions, 0),
    totalDeletions: items.reduce((sum, pr) => sum + pr.deletions, 0),
  }
}

async function fetchPullRequestConnection({
  accessToken,
  first,
  after,
  states,
}: FetchPullRequestsParams): Promise<ViewerPRsResult['viewer']['pullRequests']> {
  const data = await githubGraphQL<ViewerPRsResult>(
    VIEWER_PULL_REQUESTS_QUERY,
    { first, after, states },
    accessToken,
  )

  return data.viewer.pullRequests
}

export type FetchPullRequestsParams = {
  accessToken: string
  first?: number
  after?: string | null
  states?: PullRequestState[] | null
}

export type FetchPullRequestsResult = {
  items: PullRequestItem[]
  pageInfo: PullRequestPageInfo
  summary: PullRequestSummary
}

// 3단계: GraphQL 호출 → 데이터 변환 → 요약 통계 생성 후 반환
export async function fetchViewerPullRequests({
  accessToken,
  first = 20,
  after = null,
  states = null,
}: FetchPullRequestsParams): Promise<FetchPullRequestsResult> {
  const { totalCount, pageInfo, nodes } = await fetchPullRequestConnection({
    accessToken,
    first,
    after,
    states,
  })
  const items = nodes.map(toPullRequestItem)

  return {
    items,
    pageInfo,
    summary: computeSummary(items, totalCount),
  }
}

export async function fetchViewerPullRequestSummary(
  accessToken: string,
): Promise<PullRequestSummary> {
  const pageSize = 100
  let after: string | null = null
  let totalCount = 0
  let mergedCount = 0
  let openCount = 0
  let closedCount = 0
  let totalAdditions = 0
  let totalDeletions = 0
  let hasNextPage = true

  while (hasNextPage) {
    const connection = await fetchPullRequestConnection({
      accessToken,
      first: pageSize,
      after,
      states: null,
    })

    if (totalCount === 0) {
      totalCount = connection.totalCount
    }

    for (const item of connection.nodes.map(toPullRequestItem)) {
      if (item.state === 'MERGED') mergedCount += 1
      if (item.state === 'OPEN') openCount += 1
      if (item.state === 'CLOSED') closedCount += 1
      totalAdditions += item.additions
      totalDeletions += item.deletions
    }

    hasNextPage = connection.pageInfo.hasNextPage
    after = connection.pageInfo.endCursor
  }

  return {
    totalCount,
    mergedCount,
    openCount,
    closedCount,
    totalAdditions,
    totalDeletions,
  }
}
