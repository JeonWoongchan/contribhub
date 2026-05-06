import sql from '@/lib/db'
import { REPO_HEALTH_CACHE_TTL_HOURS } from '@/constants/scoring-rules'
import { fetchAndCacheRepoHealth } from '@/lib/github/repo-health/calculate'

export async function getRepoHealthMap(
  repoNames: string[],
  accessToken: string
): Promise<Map<string, number>> {
  if (repoNames.length === 0) return new Map()

  const healthRows = await sql`
    SELECT repo_full_name, health_score
    FROM repo_health_cache
    WHERE repo_full_name = ANY(${repoNames})
      AND cached_at > NOW() - (${REPO_HEALTH_CACHE_TTL_HOURS} * INTERVAL '1 hour')
  `

  const healthMap = new Map<string, number>(
    healthRows.map((row) => [row.repo_full_name, row.health_score])
  )

  const uncachedRepos = repoNames.filter((repoName) => !healthMap.has(repoName))
  const settled = await Promise.allSettled(
    uncachedRepos.map(async (repoName) => {
      const score = await fetchAndCacheRepoHealth(repoName, accessToken)
      return { repoName, score }
    })
  )

  for (const result of settled) {
    if (result.status !== 'fulfilled') continue
    healthMap.set(result.value.repoName, result.value.score)
  }

  return healthMap
}
