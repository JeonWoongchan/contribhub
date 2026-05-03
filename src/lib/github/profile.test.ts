import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchUserRepos, GitHubProfileError } from '@/lib/github/profile'
import { GitHubUnauthorizedError, GitHubRateLimitError } from '@/lib/github/client'

vi.mock('@/lib/env', () => ({ env: { AUTH_SECRET: 'test' } }))
vi.mock('next/headers', () => ({ headers: vi.fn() }))
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }))

function stubFetch(status: number, headers: Record<string, string> = {}, body: unknown = []) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (key: string) => headers[key] ?? null },
    json: () => Promise.resolve(body),
  }))
}

afterEach(() => vi.unstubAllGlobals())

describe('fetchUserRepos', () => {
  it('401 응답은 GitHubUnauthorizedError를 던진다', async () => {
    stubFetch(401)
    await expect(fetchUserRepos('token')).rejects.toBeInstanceOf(GitHubUnauthorizedError)
  })

  it('403 + x-ratelimit-remaining=0은 GitHubRateLimitError를 던진다', async () => {
    stubFetch(403, { 'x-ratelimit-remaining': '0' })
    await expect(fetchUserRepos('token')).rejects.toBeInstanceOf(GitHubRateLimitError)
  })

  it('403이지만 rate limit이 아닌 경우 GitHubProfileError를 던진다', async () => {
    stubFetch(403, { 'x-ratelimit-remaining': '10' })
    await expect(fetchUserRepos('token')).rejects.toBeInstanceOf(GitHubProfileError)
  })

  it('200 응답은 레포 목록을 반환한다', async () => {
    const repos = [{ name: 'my-repo', language: 'TypeScript' }]
    stubFetch(200, {}, repos)
    await expect(fetchUserRepos('token')).resolves.toEqual(repos)
  })
})
