// PR 목록 조회 API — 인증 확인 → 쿼리 파라미터 파싱 → GraphQL 호출 → 응답 반환

import { NextRequest } from 'next/server'

import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { GitHubRateLimitError } from '@/lib/github/client'
import { fetchViewerPullRequests, fetchViewerPullRequestSummary } from '@/lib/github/pull-requests'
import type { PullRequestState } from '@/types/pull-request'

// 유효한 PR 상태값 목록 — 쿼리 파라미터 검증용
const VALID_STATES: PullRequestState[] = ['OPEN', 'MERGED', 'CLOSED']

export async function GET(req: NextRequest) {
  // 1단계: 인증 토큰 확인
  const auth = await requireGithubToken(req)
  if (!auth.ok) return err(auth.error, auth.status, auth.code)

  // 2단계: 쿼리 파라미터에서 커서(after)와 상태 필터(state) 추출
  const { searchParams } = req.nextUrl
  const after = searchParams.get('after') ?? undefined
  const stateParam = searchParams.get('state')
  const summaryOnly = searchParams.get('summaryOnly') === 'true'
  const states =
    stateParam && VALID_STATES.includes(stateParam as PullRequestState)
      ? [stateParam as PullRequestState]
      : null

  // 3단계: GitHub GraphQL API 호출 및 에러 처리
  try {
    if (summaryOnly) {
      const summary = await fetchViewerPullRequestSummary(auth.accessToken)
      return ok({ summary })
    }

    const result = await fetchViewerPullRequests({
      accessToken: auth.accessToken,
      first: 20,
      after,
      states,
    })
    return ok(result)
  } catch (error) {
    if (error instanceof GitHubRateLimitError) {
      return err('GitHub API 요청 한도를 초과했습니다.', 429, ErrorCode.RATE_LIMITED)
    }
    return err('PR 목록을 불러오지 못했습니다.', 502, ErrorCode.GITHUB_ERROR)
  }
}
