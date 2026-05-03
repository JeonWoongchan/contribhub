import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  githubGraphQL,
  GitHubUnauthorizedError,
  GitHubRateLimitError,
  GitHubNotFoundError,
} from '@/lib/github/client'

function stubFetch(status: number, body: object, headers: Record<string, string> = {}) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (key: string) => headers[key] ?? null },
    json: () => Promise.resolve(body),
  }))
}

afterEach(() => vi.unstubAllGlobals())

describe('githubGraphQL', () => {
  it('HTTP 401 응답은 GitHubUnauthorizedError를 던진다', async () => {
    stubFetch(401, {})
    await expect(githubGraphQL('query {}', {}, 'token')).rejects.toBeInstanceOf(GitHubUnauthorizedError)
  })

  it('GraphQL errors.type=UNAUTHORIZED는 GitHubUnauthorizedError를 던진다', async () => {
    stubFetch(200, { errors: [{ type: 'UNAUTHORIZED', message: 'Bad credentials' }] })
    await expect(githubGraphQL('query {}', {}, 'token')).rejects.toBeInstanceOf(GitHubUnauthorizedError)
  })

  it('GraphQL errors.type=RATE_LIMITED는 GitHubRateLimitError를 던진다', async () => {
    stubFetch(200, { errors: [{ type: 'RATE_LIMITED' }] })
    await expect(githubGraphQL('query {}', {}, 'token')).rejects.toBeInstanceOf(GitHubRateLimitError)
  })

  it('GraphQL errors.type=NOT_FOUND는 GitHubNotFoundError를 던진다', async () => {
    stubFetch(200, { errors: [{ type: 'NOT_FOUND' }] })
    await expect(githubGraphQL('query {}', {}, 'token')).rejects.toBeInstanceOf(GitHubNotFoundError)
  })
})
