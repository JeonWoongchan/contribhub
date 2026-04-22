import { auth } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export type AuthResult =
  | { ok: true; userId: string; accessToken: string }
  | { ok: false; error: string; status: number }

// Route Handler 인증 유틸 — auth() + getToken() 중복 제거
// accessToken은 HttpOnly 쿠키 JWT에서만 꺼냄 (클라이언트 노출 방지)
export async function requireGithubToken(req: NextRequest): Promise<AuthResult> {
  const session = await auth()
  if (!session) {
    return { ok: false, error: 'Unauthorized', status: 401 }
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.accessToken) {
    return { ok: false, error: 'No access token', status: 401 }
  }

  return { ok: true, userId: session.user.id, accessToken: token.accessToken }
}
