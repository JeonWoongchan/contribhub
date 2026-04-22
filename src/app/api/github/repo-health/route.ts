import { NextRequest, NextResponse } from 'next/server'
import { requireGithubToken } from '@/lib/auth-utils'
import { getRepoHealth } from '@/lib/github/repo-health'

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
  } catch {
    return NextResponse.json({ error: 'Failed to fetch repo health' }, { status: 500 })
  }
}
