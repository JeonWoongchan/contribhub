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
    `is:open is:issue label:"help wanted" language:${lang}`,
  ])
}

function dedupeIssues(issues: RawIssue[]): RawIssue[] {
  const seen = new Set<string>()

  return issues.filter((issue) => {
    if (seen.has(issue.url)) {
      return false
    }

    seen.add(issue.url)
    return true
  })
}

export async function fetchCandidateIssues(
  languages: string[],
  accessToken: string
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
      githubGraphQL<SearchResult>(SEARCH_ISSUES_QUERY, { query, first: 10 }, accessToken)
    )
  )

  const issues = dedupeIssues(
    settled
      .filter(
        (result): result is PromiseFulfilledResult<SearchResult> => result.status === 'fulfilled'
      )
      .flatMap((result) => result.value.search.nodes ?? [])
  )

  const failedResults = settled.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  )

  return {
    issues,
    failedQueryCount: failedResults.length,
    totalQueryCount: queries.length,
    rateLimited: failedResults.some((result) => result.reason instanceof GitHubRateLimitError),
  }
}
