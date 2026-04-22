import { githubGraphQL, GitHubRateLimitError } from '@/lib/github/client'
import { SEARCH_ISSUES_QUERY } from '@/lib/github/queries'
import type { RawIssue } from '@/types/issue'

interface SearchResult {
  search: { nodes: RawIssue[] }
}

export type IssueSearchResult = {
  issues: RawIssue[]
  failedQueryCount: number
  totalQueryCount: number
  rateLimited: boolean
}

function buildIssueQueries(languages: string[]): string[] {
  return languages.flatMap((lang) => [
    `is:open is:issue label:"good first issue" language:${lang} sort:created`,
    `is:open is:issue label:"help wanted" language:${lang} sort:created`,
  ])
}

// englishOk: false일 때 한글 포함 이슈 우선 — 제목에 한글 문자 포함 여부로 판단
function isKoreanIssue(issue: RawIssue): boolean {
  return /[\uAC00-\uD7A3]/.test(issue.title + (issue.body ?? ''))
}

function dedupeIssues(issues: RawIssue[]): RawIssue[] {
  const seen = new Set<string>()
  return issues.filter((issue) => {
    if (seen.has(issue.url)) return false
    seen.add(issue.url)
    return true
  })
}

export async function fetchCandidateIssues(
  languages: string[],
  accessToken: string,
  englishOk: boolean = true
): Promise<IssueSearchResult> {
  const queries = buildIssueQueries(languages)

  if (queries.length === 0) {
    return {
      issues: [],
      failedQueryCount: 0,
      totalQueryCount: 0,
      rateLimited: false,
    }
  }

  const settled = await Promise.allSettled(
    queries.map((query) =>
      githubGraphQL<SearchResult>(SEARCH_ISSUES_QUERY, { query, first: 30 }, accessToken)
    )
  )

  const allIssues = settled
  .filter(
    (result): result is PromiseFulfilledResult<SearchResult> => result.status === 'fulfilled'
  )
  .flatMap((result) => result.value.search.nodes ?? [])

  const deduped = dedupeIssues(allIssues)

  // englishOk: false면 한글 이슈 앞으로, 영어 이슈 뒤로 재정렬
  const issues = englishOk
    ? deduped
    : [...deduped.filter(isKoreanIssue), ...deduped.filter((i) => !isKoreanIssue(i))]

  const failedResults = settled.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  )

  return {
    issues,
    failedQueryCount: failedResults.length,
    totalQueryCount: queries.length,
    rateLimited: failedResults.some(
      (result) => result.reason instanceof GitHubRateLimitError
    ),
  }
}
