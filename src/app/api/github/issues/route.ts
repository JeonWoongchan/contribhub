import { NextRequest } from 'next/server'

import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { getRepoHealthMap } from '@/lib/github/issues/health'
import { rankIssues } from '@/lib/github/issues/ranking'
import { fetchCandidateIssues } from '@/lib/github/issues/search'
import { loadOnboardingProfile } from '@/lib/user/profile'

export async function GET(req: NextRequest) {
  const auth = await requireGithubToken(req)
  if (!auth.ok) return err(auth.error, auth.status, auth.code)

  const profile = await loadOnboardingProfile(auth.userId)
  if (!profile) {
    return err('Onboarding not complete', 400, ErrorCode.ONBOARDING_REQUIRED)
  }

  const searchResult = await fetchCandidateIssues(profile.topLanguages, auth.accessToken)
  if (searchResult.rateLimited && searchResult.issues.length === 0) {
    return err('GitHub rate limit exceeded', 429, ErrorCode.RATE_LIMITED)
  }

  if (searchResult.failedQueryCount === searchResult.totalQueryCount && searchResult.totalQueryCount > 0) {
    return err('Failed to fetch GitHub issues', 502, ErrorCode.GITHUB_ERROR)
  }

  const repoNames = [...new Set(searchResult.issues.map((issue) => issue.repository.nameWithOwner))]
  const healthMap = await getRepoHealthMap(repoNames, auth.accessToken)
  const issues = rankIssues(searchResult.issues, profile, healthMap)

  return ok({
    issues,
    total: issues.length,
    partialResults: searchResult.failedQueryCount > 0,
    failedQueryCount: searchResult.failedQueryCount,
  })
}
