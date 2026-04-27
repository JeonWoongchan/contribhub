// PR 목록 조회 API — 인증 확인 → GraphQL 전체 조회 → 필터링 → 목록 + 통계 반환

import { unstable_cache } from 'next/cache'
import { NextRequest } from 'next/server'

import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { GitHubRateLimitError } from '@/lib/github/client'
import { fetchViewerPullRequests } from '@/lib/github/pull-requests'
import { GITHUB_API_CACHE_TTL_SECONDS } from '@/constants/scoring-rules'

export async function GET(req: NextRequest) {
  const auth = await requireGithubToken(req)
  if (!auth.ok) return err(auth.error, auth.status, auth.code)

  // PR 데이터는 사용자별로 다르므로 캐시 키에 userId 포함
  const getCachedPRs = unstable_cache(
    () => fetchViewerPullRequests({ accessToken: auth.accessToken, viewerLogin: auth.githubLogin }),
    ['github-pull-requests', auth.userId],
    { revalidate: GITHUB_API_CACHE_TTL_SECONDS }
  )

  try {
    const result = await getCachedPRs()
    return ok(result)
  } catch (error) {
    if (error instanceof GitHubRateLimitError) {
      return err('GitHub API 요청 한도를 초과했습니다.', 429, ErrorCode.RATE_LIMITED)
    }
    return err('PR 목록을 불러오지 못했습니다.', 502, ErrorCode.GITHUB_ERROR)
  }
}
