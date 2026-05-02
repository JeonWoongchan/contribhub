import { unstable_cache } from 'next/cache'
import { NextRequest } from 'next/server'
import { z } from 'zod'

import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { GitHubRateLimitError } from '@/lib/github/client'
import { fetchViewerPullRequests } from '@/lib/github/pull-requests'
import { GITHUB_API_CACHE_TTL_SECONDS, PAGE_SIZE } from '@/constants/scoring-rules'

const stateSchema = z.enum(['OPEN', 'MERGED', 'CLOSED']).nullable().catch(null)

export async function GET(req: NextRequest) {
    const auth = await requireGithubToken(req)
    if (!auth.ok) return err(auth.error, auth.status, auth.code)

    const { searchParams } = new URL(req.url)
    const offset = Math.max(Number(searchParams.get('offset') ?? '0') || 0, 0)
    const stateFilter = stateSchema.parse(searchParams.get('state'))

    // PR 데이터는 사용자별로 다르므로 캐시 키에 userId 포함
    const getCachedPRs = unstable_cache(
        () => fetchViewerPullRequests({ accessToken: auth.accessToken, viewerLogin: auth.githubLogin }),
        ['github-pull-requests', auth.userId],
        { revalidate: GITHUB_API_CACHE_TTL_SECONDS }
    )

    try {
        const result = await getCachedPRs()

        const filteredItems = stateFilter
            ? result.items.filter((pr) => pr.state === stateFilter)
            : result.items

        return ok({
            items: filteredItems.slice(offset, offset + PAGE_SIZE),
            summary: result.summary,
            total: filteredItems.length,
            hasMore: offset + PAGE_SIZE < filteredItems.length,
            offset,
        })
    } catch (error) {
        if (error instanceof GitHubRateLimitError) {
            return err('GitHub API 요청 한도를 초과했습니다.', 429, ErrorCode.RATE_LIMITED)
        }
        return err('PR 목록을 불러오지 못했습니다.', 502, ErrorCode.GITHUB_ERROR)
    }
}
