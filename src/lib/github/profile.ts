// src/lib/github/profile.ts

import { getToken } from 'next-auth/jwt'
import { headers } from 'next/headers'

// 레포 목록에서 언어 사용 빈도 집계
export function aggregateLanguages(repos: { language: string | null }[]): string[] {
  const langCount: Record<string, number> = {}

  for (const repo of repos) {
    if (!repo.language) continue
    langCount[repo.language] = (langCount[repo.language] ?? 0) + 1
  }

  return Object.entries(langCount)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([lang]) => lang)
}

// GitHub 토큰 획득
async function getAccessToken(): Promise<string | null> {
  const token = await getToken({
    req: { headers: await headers() } as Request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  return token?.accessToken ?? null
}

// GitHub 레포 목록 fetch
async function fetchUserRepos(accessToken: string): Promise<{ language: string | null }[]> {
  const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })

  if (!res.ok) return []
  return res.json()
}

// 토큰 획득 → 레포 fetch → 언어 집계 조합
export async function getTopLanguagesFromGitHub(): Promise<string[]> {
  try {
    const token = await getAccessToken()
    if (!token) return []

    const repos = await fetchUserRepos(token)
    return aggregateLanguages(repos)
  } catch {
    // 실패해도 빈 배열로 진행 — 유저가 직접 선택
    return []
  }
}
