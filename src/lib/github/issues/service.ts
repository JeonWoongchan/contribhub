import { unstable_cache } from 'next/cache'

import { listUserBookmarkKeys } from '@/lib/bookmarks'
import { encodeBatch, decodeBatch, INITIAL_BATCH } from '@/lib/github/batch'
import { GITHUB_API_CACHE_TTL_SECONDS, PAGE_SIZE } from '@/constants/scoring-rules'
import type { IssueFilters, ScoredIssue } from '@/types/issue'
import type { OnboardingProfile } from '@/lib/user/profile'
import { applyFilters } from './filters'
import { getRepoHealthMap } from './health'
import { rankIssues } from './ranking'
import { fetchCandidateIssues } from './search'

export type IssuePageData = {
    issues: ScoredIssue[]
    total: number
    hasMore: boolean
    offset: number
    batch: string
    nextBatch: string | null
    availableLanguages: string[]
    partialResults: boolean
    failedQueryCount: number
}

export type IssuePageError = { error: 'rate_limited' } | { error: 'all_failed' }

export async function fetchIssueListPage({
    userId,
    accessToken,
    profile,
    filters,
    offset,
    batchParam,
}: {
    userId: string
    accessToken: string
    profile: OnboardingProfile
    filters: IssueFilters
    offset: number
    batchParam: string
}): Promise<IssuePageData | IssuePageError> {
    const afterCursors = batchParam === INITIAL_BATCH
        ? {}
        : (decodeBatch<Record<string, string | null>>(batchParam) ?? {})

    // 배치별로 캐시 분리 — 같은 언어 조합이라도 batch가 다르면 별도 GitHub 호출
    const getCachedIssues = unstable_cache(
        () => fetchCandidateIssues(profile.topLanguages, accessToken, afterCursors),
        ['github-issues', ...profile.topLanguages.slice().sort(), batchParam],
        { revalidate: GITHUB_API_CACHE_TTL_SECONDS }
    )

    // GitHub 이슈 검색(캐시)과 북마크 키 목록 조회를 병렬 실행 — 서로 의존성 없음
    const [searchResult, bookmarkKeyList] = await Promise.all([
        getCachedIssues(),
        listUserBookmarkKeys(userId),
    ])

    if (searchResult.rateLimited && searchResult.issues.length === 0) {
        return { error: 'rate_limited' }
    }
    if (searchResult.failedQueryCount === searchResult.totalQueryCount && searchResult.totalQueryCount > 0) {
        return { error: 'all_failed' }
    }

    // 이슈에 포함된 레포 health 점수 조회 — 채점 시 저활성 레포 필터링 기준으로 사용
    const repoNames = [...new Set(searchResult.issues.map((issue) => issue.repository.nameWithOwner))]
    const healthMap = await getRepoHealthMap(repoNames, accessToken)

    // 이슈 채점·정렬 후 북마크 여부 병합
    const bookmarkKeys = new Set(bookmarkKeyList)
    const randomSeed = `${userId}:${batchParam}`
    const rankedIssues = rankIssues(searchResult.issues, profile, healthMap, randomSeed).map((issue) => ({
        ...issue,
        isBookmarked: bookmarkKeys.has(`${issue.repoFullName}#${issue.number}`),
    }))

    // 필터 적용 전 언어 목록 수집 — 필터 적용 여부와 무관하게 사용 가능한 언어 전달
    const availableLanguages = [...new Set(
        rankedIssues.map((i) => i.language).filter((l): l is string => l !== null)
    )]

    const allIssues = applyFilters(rankedIssues, filters)

    // 현재 배치 캐시 소진 여부 판단 — offset이 캐시 끝에 도달하면 마지막 페이지
    const isLastPage = offset + PAGE_SIZE >= allIssues.length

    // 마지막 페이지이고 GitHub에 다음 페이지가 있으면 언어별 endCursor를 인코딩해 nextBatch로 전달
    // 클라이언트는 이 값을 다음 요청의 batch 파라미터로 사용해 새 GitHub 배치를 요청한다
    const nextBatch = isLastPage && searchResult.hasMoreOnGithub
        ? encodeBatch(searchResult.endCursors)
        : null

    return {
        issues: allIssues.slice(offset, offset + PAGE_SIZE),
        total: allIssues.length,
        hasMore: !isLastPage || searchResult.hasMoreOnGithub,
        offset,
        batch: batchParam,
        nextBatch,
        availableLanguages,
        partialResults: searchResult.failedQueryCount > 0,
        failedQueryCount: searchResult.failedQueryCount,
    }
}
