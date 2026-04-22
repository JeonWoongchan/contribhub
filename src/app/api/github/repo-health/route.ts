import { auth } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { getRepoHealth } from '@/lib/github/repo-health'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const repo = searchParams.get('repo')

  if (!repo || !repo.includes('/')) {
    return NextResponse.json({ error: 'Invalid repo format. Use owner/name' }, { status: 400 })
  }

  try {
    const healthScore = await getRepoHealth(repo, token.accessToken as string)
    return NextResponse.json({ repo, healthScore })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch repo health' }, { status: 500 })
  }
}
