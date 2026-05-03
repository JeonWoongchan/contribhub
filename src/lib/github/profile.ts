import { headers } from 'next/headers'
import { getToken } from 'next-auth/jwt'

import type { GitHubRepo } from '@/types/github'
import { GITHUB_API_TIMEOUT_MS } from '@/constants/scoring-rules'
import { env } from '@/lib/env'

const GITHUB_USER_REPOS_URL = 'https://api.github.com/user/repos?per_page=100&sort=updated'

export class GitHubProfileError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GitHubProfileError'
    this.status = status
  }
}

export function aggregateLanguages(repos: Pick<GitHubRepo, 'language'>[]): string[] {
  const languageCount: Record<string, number> = {}

  for (const repo of repos) {
    if (!repo.language) continue
    languageCount[repo.language] = (languageCount[repo.language] ?? 0) + 1
  }

  return Object.entries(languageCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([language]) => language)
}

export async function fetchUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const response = await fetch(GITHUB_USER_REPOS_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(GITHUB_API_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new GitHubProfileError('GitHub API error', response.status)
  }

  return (await response.json()) as GitHubRepo[]
}

export async function getTopLanguagesByAccessToken(accessToken: string): Promise<string[]> {
  const repos = await fetchUserRepos(accessToken)
  return aggregateLanguages(repos)
}

async function getAccessToken(): Promise<string | null> {
  const token = await getToken({
    req: { headers: await headers() } as Request,
    secret: env.AUTH_SECRET,
  })

  return token?.accessToken ?? null
}

export async function getTopLanguagesFromGitHub(): Promise<string[]> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return []

    return await getTopLanguagesByAccessToken(accessToken)
  } catch {
    return []
  }
}
