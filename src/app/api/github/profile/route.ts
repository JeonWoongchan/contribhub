import { auth } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import type { GitHubRepo } from '@/types/github'
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
  // 1. 세션 확인 — HttpOnly 쿠키 JWT 복호화 (네트워크 요청 없음)
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. 같은 JWT에서 accessToken 추출
  //    session 객체에는 accessToken을 노출하지 않으므로 getToken()으로 직접 꺼냄
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })
  if (!token?.accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 })
  }

  try {
    // 3. GitHub REST API로 유저 레포 목록 조회 (최대 100개, 최근 업데이트 순)
    //    cache: 'no-store' — 언어 분석은 항상 최신 데이터 사용
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })
    if (!response.ok) {
      return NextResponse.json({ error: 'GitHub API error' }, { status: response.status })
    }

    const repos = await response.json() as GitHubRepo[]

    // 4. 레포별 언어 집계 — language 없는 레포(null)는 제외
    const languageCount: Record<string, number> = {}
    for (const repo of repos) {
      if (!repo.language) continue
      languageCount[repo.language] = (languageCount[repo.language] ?? 0) + 1
    }

    // 5. 사용 빈도 내림차순 정렬 후 상위 5개만 반환
    const topLanguages = Object.entries(languageCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([language]) => language)

    return NextResponse.json({ topLanguages })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch GitHub profile' }, { status: 500 })
  }
}
