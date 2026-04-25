// 깃헙 GraphQL pr 데이터 조회 시 사용하는 타입들을 정의

export type PullRequestState = 'OPEN' | 'MERGED' | 'CLOSED'

// GraphQL 응답 원시 데이터
export interface RawPullRequest {
  title: string
  url: string
  state: PullRequestState
  createdAt: string
  mergedAt: string | null
  closedAt: string | null
  additions: number
  deletions: number
  changedFiles: number
  comments: { totalCount: number }
  reviews: { totalCount: number }
  labels: { nodes: { name: string }[] }
  commits: { totalCount: number }
  repository: {
    nameWithOwner: string
    url: string
    stargazerCount: number
    primaryLanguage: { name: string } | null
  }
}

// RawPullRequest의 중첩 구조를 평탄화한 클라이언트용 PR 항목
export interface PullRequestItem {
  title: string
  url: string
  state: PullRequestState
  createdAt: string
  mergedAt: string | null
  closedAt: string | null
  additions: number
  deletions: number
  changedFiles: number
  commentCount: number
  reviewCount: number
  commitCount: number
  labels: string[]
  repoFullName: string
  repoUrl: string
  stargazerCount: number
  language: string | null
}

// 커서 기반 페이지네이션 정보
export interface PullRequestPageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

// 페이지 상단에 표시할 요약 통계
export interface PullRequestSummary {
  totalCount: number
  mergedCount: number
  openCount: number
  closedCount: number
  totalAdditions: number
  totalDeletions: number
}
