import type { IssueCardItem, ScoredIssue } from './issue'
import type { PullRequestItem, PullRequestSummary } from './pull-request'

// 서버 api-response.ts의 ok(), err() 응답 형태에 대응하는 클라이언트 타입
export type ApiResponse<T> =
    | { ok: true; data: T }
    | { ok: false; error?: { message?: string; code?: string } }

// GET /api/github/issues 응답 data 타입
export type IssueListPage = {
    issues: ScoredIssue[]
    total: number
    hasMore: boolean
    offset: number
    batch: string
    nextBatch: string | null
    canLoadMoreCandidates: boolean
    availableLanguages: string[]
    partialResults: boolean
    failedQueryCount: number
}

// GET /api/github/pull-requests 응답 data 타입
export type PRListPage = {
    items: PullRequestItem[]
    summary: PullRequestSummary
    total: number
    hasMore: boolean
    offset: number
}

// GET /api/bookmarks 응답 data 타입
export type BookmarkPageInfo = {
    limit: number
    offset: number
    total: number
    hasMore: boolean
}

export type BookmarkListPage = {
    issues: IssueCardItem[]
    pageInfo: BookmarkPageInfo
}
