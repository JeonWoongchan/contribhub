import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { err, ErrorCode, ok } from '@/lib/api-response'
import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import { GITHUB_RATE_LIMITED_MESSAGE, GITHUB_UNAUTHORIZED_MESSAGE } from '@/lib/github/error-response'
import { INITIAL_BATCH } from '@/lib/github/batch'
import { parseIssueFilters } from '@/lib/github/issues/filters'
import { fetchIssueListPage } from '@/lib/github/issues/service'
import { loadOnboardingProfile, type OnboardingProfile } from '@/lib/user/profile'
import { offsetSchema } from '@/lib/validators/pagination'
import { GUEST_ONBOARDING_PROFILE } from '@/constants/guest-profile'

export async function GET(req: NextRequest) {
    const session = await auth()

    let userId: string | null
    let accessToken: string
    let profile: OnboardingProfile

    if (!session) {
        // 게스트 모드: 서버 GitHub 토큰과 기본 온보딩 프로필로 이슈 조회
        const serverToken = process.env.GITHUB_TOKEN
        if (!serverToken) return err('Unauthorized', 401, ErrorCode.UNAUTHORIZED)
        userId = null
        accessToken = serverToken
        profile = GUEST_ONBOARDING_PROFILE
    } else {
        // 로그인 사용자: JWT에서 액세스 토큰 추출 후 개인 온보딩 프로필 적용
        const secureCookie = process.env.NODE_ENV === 'production'
        const token = await getToken({ req, secret: env.AUTH_SECRET, secureCookie })
        if (!token?.accessToken) return err('No access token', 401, ErrorCode.NO_ACCESS_TOKEN)

        userId = session.user.id
        accessToken = token.accessToken
        const loaded = await loadOnboardingProfile(userId)
        if (!loaded) return err('Onboarding not complete', 400, ErrorCode.ONBOARDING_REQUIRED)
        profile = loaded
    }

    try {
        const { searchParams } = new URL(req.url)
        const offset = offsetSchema.parse(searchParams.get('offset'))
        const batchParam = searchParams.get('batch') ?? INITIAL_BATCH
        const filters = parseIssueFilters(searchParams)

        const result = await fetchIssueListPage({
            userId,
            accessToken,
            profile,
            filters,
            offset,
            batchParam,
        })

        if ('error' in result) {
            if (result.error === 'invalid_batch') return err('잘못된 배치 커서입니다.', 400, ErrorCode.INVALID_REQUEST)
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
