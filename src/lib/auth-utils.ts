import { auth } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { ErrorCode } from '@/lib/api-response'
import { env } from '@/lib/env'

export type AuthResult =
  | { ok: true; userId: string; accessToken: string; githubLogin: string }
  | { ok: false; error: string; status: number; code: ErrorCode }

// Route Handler 인증 유틸 — auth() + getToken() 중복 제거
// accessToken은 HttpOnly 쿠키 JWT에서만 꺼냄 (클라이언트 노출 방지)
export async function requireGithubToken(req: NextRequest): Promise<AuthResult> {
  const session = await auth()
  if (!session) {
    return { ok: false, error: 'Unauthorized', status: 401, code: ErrorCode.UNAUTHORIZED }
  }

  // NextAuth v5는 AUTH_SECRET을 사용한다. NEXTAUTH_SECRET은 v4 이름으로 다른 변수다.
  const token = await getToken({ req, secret: env.AUTH_SECRET })
  if (!token?.accessToken) {
    return { ok: false, error: 'No access token', status: 401, code: ErrorCode.NO_ACCESS_TOKEN }
  }

  return { ok: true, userId: session.user.id, accessToken: token.accessToken, githubLogin: token.githubLogin ?? '' }
}
