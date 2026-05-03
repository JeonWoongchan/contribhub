import { NextRequest } from 'next/server'
import { ok, err, ErrorCode } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { getGitHubErrorResponse } from '@/lib/github/error-response'
import { getTopLanguagesByAccessToken } from '@/lib/github/profile'

/**
 * GET /api/github/profile
 *
 * 동작 방식:
 * 1. auth()로 HttpOnly 쿠키의 JWT를 복호화해 세션 확인 (네트워크 요청 없음)
 * 2. getToken()으로 같은 JWT에서 accessToken 추출
 * 3. GitHub REST API로 유저 레포 목록 조회 (최대 100개, 최근 업데이트 순)
 * 4. 레포별 언어 집계 후 상위 5개 반환
 *
 * auth()와 getToken() 둘 다 쓰는 이유:
 * - auth()는 세션 유효성 확인용
 * - getToken()은 JWT 내부의 accessToken 꺼내기 위함
 *   (session 객체에는 accessToken을 노출하지 않으므로)
 */
export async function GET(req: NextRequest) {
  const auth = await requireGithubToken(req)
  if (!auth.ok) return err(auth.error, auth.status, auth.code)

  try {
    const topLanguages = await getTopLanguagesByAccessToken(auth.accessToken)
    return ok({ topLanguages })
  } catch (error) {
    return getGitHubErrorResponse(error, { fallbackMessage: 'Failed to fetch GitHub profile', fallbackStatus: 500, fallbackCode: ErrorCode.INTERNAL_ERROR })
  }
}
