import { NextRequest } from 'next/server'

import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { GITHUB_RATE_LIMITED_MESSAGE, GITHUB_UNAUTHORIZED_MESSAGE } from '@/lib/github/error-response'
import { INITIAL_BATCH } from '@/lib/github/batch'
import { parseIssueFilters } from '@/lib/github/issues/filters'
import { fetchIssueListPage } from '@/lib/github/issues/service'
import { loadOnboardingProfile } from '@/lib/user/profile'
import { offsetSchema } from '@/lib/validators/pagination'

export async function GET(req: NextRequest) {
    const t0 = Date.now()
    const auth = await requireGithubToken(req)
    if (!auth.ok) return err(auth.error, auth.status, auth.code)
    const t1 = Date.now()

    try {
        const profile = await loadOnboardingProfile(auth.userId)
        if (!profile) return err('Onboarding not complete', 400, ErrorCode.ONBOARDING_REQUIRED)
        const t2 = Date.now()

        const { searchParams } = new URL(req.url)
        const offset = offsetSchema.parse(searchParams.get('offset'))
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
        const t3 = Date.now()
        // TODO: 타이밍 분석 후 제거
        console.log(`[TIMING] route | session=${t1 - t0}ms profile=${t2 - t1}ms service=${t3 - t2}ms total=${t3 - t0}ms | batch=${batchParam.slice(0, 12)} offset=${offset}`)

        if ('error' in result) {
            if (result.error === 'rate_limited') return err(GITHUB_RATE_LIMITED_MESSAGE, 429, ErrorCode.RATE_LIMITED)
            if (result.error === 'unauthorized') return err(GITHUB_UNAUTHORIZED_MESSAGE, 401, ErrorCode.UNAUTHORIZED)
            return err('이슈 목록을 불러오지 못했습니다.', 502, ErrorCode.GITHUB_ERROR)
        }

        return ok(result)
    } catch (error) {
        console.error('[GET /api/github/issues] 이슈 목록 조회 실패:', error)
        return err('Failed to fetch issues', 500, ErrorCode.INTERNAL_ERROR)
    }
}
