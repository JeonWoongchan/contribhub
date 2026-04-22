import { NextRequest, NextResponse } from 'next/server'
import { requireGithubToken } from '@/lib/auth-utils'
import { getRepoHealth } from '@/lib/github/repo-health'
import {GitHubRateLimitError} from "@/lib/github/client";

export async function GET(req: NextRequest) {
  const auth = await requireGithubToken(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const repo = searchParams.get('repo')

  if (!repo || !repo.includes('/')) {
    return NextResponse.json({ error: 'Invalid repo format. Use owner/name' }, { status: 400 })
  }

  try {
    const healthScore = await getRepoHealth(repo, auth.accessToken)
    return NextResponse.json({ repo, healthScore })
  } catch (e) {
    if (e instanceof GitHubRateLimitError) {
      return NextResponse.json({ error: 'GitHub rate limit exceeded' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Failed to fetch repo health' }, { status: 500 })
  }
}
