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
    next: { revalidate: 600 }, // 10분 캐시
  })

  if (!res.ok) {
    throw new Error(`GitHub GraphQL error: ${res.status}`)
  }

  const json = await res.json()

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? 'GraphQL error')
  }

  return json.data as T
}
