import { unstable_cache } from 'next/cache'
import { NextRequest } from 'next/server'

import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { listUserBookmarkKeys } from '@/lib/bookmarks'
import { getRepoHealthMap } from '@/lib/github/issues/health'
import { rankIssues } from '@/lib/github/issues/ranking'
import { fetchCandidateIssues } from '@/lib/github/issues/search'
import { loadOnboardingProfile } from '@/lib/user/profile'
import { GITHUB_API_CACHE_TTL_SECONDS } from '@/constants/scoring-rules'

export async function GET(req: NextRequest) {
  const auth = await requireGithubToken(req)
  if (!auth.ok) return err(auth.error, auth.status, auth.code)

  const profile = await loadOnboardingProfile(auth.userId)
  if (!profile) {
    return err('Onboarding not complete', 400, ErrorCode.ONBOARDING_REQUIRED)
  }

  // 이슈 검색 결과는 공개 데이터라 동일 언어 조합이면 사용자 구분 없이 캐시 공유
  const getCachedIssues = unstable_cache(
    () => fetchCandidateIssues(profile.topLanguages, auth.accessToken),
    ['github-issues', ...profile.topLanguages.slice().sort()],
    { revalidate: GITHUB_API_CACHE_TTL_SECONDS }
  )

  // GitHub 검색(캐시)과 북마크 DB 조회를 병렬 실행 — 서로 의존성 없음
  const [searchResult, bookmarkKeyList] = await Promise.all([
    getCachedIssues(),
    listUserBookmarkKeys(auth.userId),
  ])

  if (searchResult.rateLimited && searchResult.issues.length === 0) {
    return err('GitHub rate limit exceeded', 429, ErrorCode.RATE_LIMITED)
  }

  if (searchResult.failedQueryCount === searchResult.totalQueryCount && searchResult.totalQueryCount > 0) {
    return err('Failed to fetch GitHub issues', 502, ErrorCode.GITHUB_ERROR)
  }

  const repoNames = [...new Set(searchResult.issues.map((issue) => issue.repository.nameWithOwner))]
  const healthMap = await getRepoHealthMap(repoNames, auth.accessToken)
  const bookmarkKeys = new Set(bookmarkKeyList)
  const issues = rankIssues(searchResult.issues, profile, healthMap).map((issue) => ({
    ...issue,
    isBookmarked: bookmarkKeys.has(`${issue.repoFullName}#${issue.number}`),
  }))

  return ok({
    issues,
    total: issues.length,
    partialResults: searchResult.failedQueryCount > 0,
    failedQueryCount: searchResult.failedQueryCount,
  })
}
