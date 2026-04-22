import { NextRequest } from 'next/server'
import { requireGithubToken } from '@/lib/auth-utils'
import { getRepoHealth } from '@/lib/github/repo-health'
import { GitHubRateLimitError } from '@/lib/github/client'
import { ok, err, ErrorCode } from '@/lib/api-response'

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
    if (e instanceof GitHubRateLimitError) {
      return err('GitHub rate limit exceeded', 429, ErrorCode.RATE_LIMITED)
    }
    return err('Failed to fetch repo health', 500, ErrorCode.INTERNAL_ERROR)
  }
}
