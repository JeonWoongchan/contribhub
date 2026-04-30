import { NextRequest } from 'next/server'
import { err, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { getMyPageActivity } from '@/lib/user/my-page'

export async function GET(req: NextRequest) {
  const auth = await requireGithubToken(req)
  if (!auth.ok) return err(auth.error, auth.status, auth.code)

  const data = await getMyPageActivity(auth.userId, auth.accessToken, auth.githubLogin)

  return ok(data)
}
