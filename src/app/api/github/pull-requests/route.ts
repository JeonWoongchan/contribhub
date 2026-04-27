// PR 목록 조회 API — 인증 확인 → GraphQL 전체 조회 → 필터링 → 목록 + 통계 반환

import { NextRequest } from 'next/server'

import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { GitHubRateLimitError } from '@/lib/github/client'
import { fetchViewerPullRequests } from '@/lib/github/pull-requests'

export async function GET(req: NextRequest) {
  const auth = await requireGithubToken(req)
  if (!auth.ok) return err(auth.error, auth.status, auth.code)

  try {
    const result = await fetchViewerPullRequests({
      accessToken: auth.accessToken,
      viewerLogin: auth.githubLogin,
    })
    return ok(result)
  } catch (error) {
    if (error instanceof GitHubRateLimitError) {
      return err('GitHub API 요청 한도를 초과했습니다.', 429, ErrorCode.RATE_LIMITED)
    }
    return err('PR 목록을 불러오지 못했습니다.', 502, ErrorCode.GITHUB_ERROR)
  }
}
