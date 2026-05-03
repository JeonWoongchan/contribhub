import { GITHUB_API_TIMEOUT_MS } from '@/constants/scoring-rules'

export class GitHubRateLimitError extends Error {
  constructor() {
    super('RATE_LIMITED')
    this.name = 'GitHubRateLimitError'
  }
}

export class GitHubUnauthorizedError extends Error {
  constructor() {
    super('UNAUTHORIZED')
    this.name = 'GitHubUnauthorizedError'
  }
}

export class GitHubNotFoundError extends Error {
  constructor() {
    super('NOT_FOUND')
    this.name = 'GitHubNotFoundError'
  }
}

export async function githubGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  accessToken: string
): Promise<T> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(GITHUB_API_TIMEOUT_MS),
  })

  if (!res.ok) {
    if (res.status === 401) {
      throw new GitHubUnauthorizedError()
    }
    if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
      throw new GitHubRateLimitError()
    }
    throw new Error(`GitHub GraphQL error: ${res.status}`)
  }

  const json = await res.json()

  // GraphQL 에러 타입별 구분 — 새 타입 추가 시 case만 추가
  if (json.errors?.length > 0) {
    const firstError = json.errors[0]

    switch (firstError.type) {
    case 'RATE_LIMITED': throw new GitHubRateLimitError()
    case 'NOT_FOUND':    throw new GitHubNotFoundError()
    default:             throw new Error(firstError.message ?? 'GraphQL error')
    }
  }

  return json.data as T
}
