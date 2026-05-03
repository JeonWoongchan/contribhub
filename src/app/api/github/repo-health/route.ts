import { NextRequest } from 'next/server'
import { requireGithubToken } from '@/lib/auth-utils'
import { getRepoHealth } from '@/lib/github/repo-health/calculate'
import { ok, err, ErrorCode } from '@/lib/api-response'
import { getGitHubErrorResponse } from '@/lib/github/error-response'

export async function GET(req: NextRequest) {
  const auth = await requireGithubToken(req)
  if (!auth.ok) return err(auth.error, auth.status, auth.code)

  const { searchParams } = new URL(req.url)
  const repo = searchParams.get('repo')

  if (!repo || !repo.includes('/')) {
    return err('Invalid repo format. Use owner/name', 400, ErrorCode.INVALID_REPO)
  }

  try {
    const healthScore = await getRepoHealth(repo, auth.accessToken)
    return ok({ repo, healthScore })
  } catch (e) {
    return getGitHubErrorResponse(e, {
      fallbackMessage: 'Failed to fetch repo health',
      fallbackStatus: 500,
      fallbackCode: ErrorCode.INTERNAL_ERROR,
      notFoundMessage: 'Repository not found',
    })
  }
}
