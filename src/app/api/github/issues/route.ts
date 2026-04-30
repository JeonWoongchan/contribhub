import { NextRequest } from 'next/server'

import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { INITIAL_BATCH } from '@/lib/github/batch'
import { parseIssueFilters } from '@/lib/github/issues/filters'
import { fetchIssueListPage } from '@/lib/github/issues/service'
import { loadOnboardingProfile } from '@/lib/user/profile'

export async function GET(req: NextRequest) {
    const auth = await requireGithubToken(req)
    if (!auth.ok) return err(auth.error, auth.status, auth.code)

    const profile = await loadOnboardingProfile(auth.userId)
    if (!profile) return err('Onboarding not complete', 400, ErrorCode.ONBOARDING_REQUIRED)

    const { searchParams } = new URL(req.url)
    const offset = Math.max(Number(searchParams.get('offset') ?? '0') || 0, 0)
    const batchParam = searchParams.get('batch') ?? INITIAL_BATCH
    const filters = parseIssueFilters(searchParams)

    const result = await fetchIssueListPage({
        userId: auth.userId,
        accessToken: auth.accessToken,
        profile,
        filters,
        offset,
        batchParam,
    })

    if ('error' in result) {
        if (result.error === 'rate_limited') return err('GitHub rate limit exceeded', 429, ErrorCode.RATE_LIMITED)
        return err('Failed to fetch GitHub issues', 502, ErrorCode.GITHUB_ERROR)
    }

    return ok(result)
}
