import { auth } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import type { GitHubRepo } from '@/types/github'

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token?.accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 })
  }

  try {
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

    const languageCount: Record<string, number> = {}

    for (const repo of repos) {
      if (!repo.language) {
        continue
      }

      languageCount[repo.language] = (languageCount[repo.language] ?? 0) + 1
    }

    const topLanguages = Object.entries(languageCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([language]) => language)

    return NextResponse.json({ topLanguages })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch GitHub profile' }, { status: 500 })
  }
}