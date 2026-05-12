import { githubGraphQL, GitHubRateLimitError, GitHubUnauthorizedError } from '@/lib/github/client'
import { MIN_CANDIDATE_REPO_STARS } from '@/constants/scoring-rules'
import type { RawIssue } from '@/types/issue'

const SEARCH_ISSUES_QUERY = `
  query SearchIssues($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: ISSUE, first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on Issue {
          number
          title
          url
          body
          createdAt
          updatedAt
          comments { totalCount }
          reactions { totalCount }
          labels(first: 10) {
            nodes { name }
          }
          repository {
            nameWithOwner
            url
            primaryLanguage { name }
            stargazerCount
            pushedAt
          }
          timelineItems(first: 5, itemTypes: [CROSS_REFERENCED_EVENT]) {
            nodes {
              __typename
              ... on CrossReferencedEvent {
                source {
                  __typename
                }
              }
            }
          }
        }
      }
    }
  }
`

interface PageInfo {
    hasNextPage: boolean
    endCursor: string | null
}

interface SearchResult {
    search: {
        pageInfo: PageInfo
        nodes: RawIssue[]
    }
}

export type IssueSearchResult = {
    issues: RawIssue[]
    // 언어별 GitHub endCursor — 다음 배치 요청 시 사용
    endCursors: Record<string, string | null>
    hasMoreOnGithub: boolean
    failedQueryCount: number
    totalQueryCount: number
    rateLimited: boolean
    unauthorized: boolean
}

// 언어별 GitHub 이슈 검색 쿼리 문자열 생성(최근 업데이트순 정렬)
function buildIssueQueries(languages: string[]): string[] {
    return languages.map(
        (lang) => `is:open is:issue label:"help wanted" language:${lang} sort:updated-desc`
    )
}

// URL 기준 중복 이슈 제거
function dedupeIssues(issues: RawIssue[]): RawIssue[] {
    const seen = new Set<string>()
    return issues.filter((issue) => {
        if (seen.has(issue.url)) return false
        seen.add(issue.url)
        return true
    })
}

// 언어별 병렬 GitHub 검색 후 후보 이슈 수집 및 반환
export async function fetchCandidateIssues(
    languages: string[],
    accessToken: string,
    afterCursors: Record<string, string | null> = {}
): Promise<IssueSearchResult> {
    const queries = buildIssueQueries(languages)

    if (queries.length === 0) {
        return {
            issues: [],
            endCursors: {},
            hasMoreOnGithub: false,
            failedQueryCount: 0,
            totalQueryCount: 0,
            rateLimited: false,
            unauthorized: false,
        }
    }

    const settled = await Promise.allSettled(
        queries.map((query, i) =>
            githubGraphQL<SearchResult>(
                SEARCH_ISSUES_QUERY,
                { query, first: 30, after: afterCursors[languages[i]] ?? null },
                accessToken
            )
        )
    )

    // settled 원본 인덱스 기준으로 cursor 수집 — filter 후 인덱스를 쓰면 실패한 쿼리 제외로 언어 매핑이 어긋남
    const endCursors: Record<string, string | null> = {}
    let hasMoreOnGithub = false

    settled.forEach((result, i) => {
        if (result.status !== 'fulfilled') return
        const { pageInfo } = result.value.search
        endCursors[languages[i]] = pageInfo.endCursor
        if (pageInfo.hasNextPage) hasMoreOnGithub = true
    })

    // GitHub 검색 인덱스와 실제 API 응답 간 시차로 인해 stars 조건을 통과한 것처럼
    // 보이지만 stargazerCount가 기준 미달인 레포가 포함될 수 있어 응답 단에서 한 번 더 필터링
    const issues = dedupeIssues(
        settled
            .filter((result): result is PromiseFulfilledResult<SearchResult> => result.status === 'fulfilled')
            .flatMap((result) => result.value.search.nodes ?? [])
    ).filter((issue) => issue.repository.stargazerCount >= MIN_CANDIDATE_REPO_STARS)

    const failedResults = settled.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
    )

    return {
        issues,
        endCursors,
        hasMoreOnGithub,
        failedQueryCount: failedResults.length,
        totalQueryCount: queries.length,
        rateLimited: failedResults.some((result) => result.reason instanceof GitHubRateLimitError),
        unauthorized: failedResults.some((result) => result.reason instanceof GitHubUnauthorizedError),
    }
}
