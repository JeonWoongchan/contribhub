import { unstable_cache } from 'next/cache'

import { listUserBookmarkKeys } from '@/lib/bookmarks'
import { encodeBatch, decodeBatch, INITIAL_BATCH } from '@/lib/github/batch'
import { GITHUB_API_CACHE_TTL_SECONDS, MIN_CANDIDATE_REPO_STARS, PAGE_SIZE } from '@/constants/scoring-rules'
import type { IssueFilters } from '@/types/issue'
import type { IssueListPage } from '@/types/api'
import type { OnboardingProfile } from '@/lib/user/profile'
import { applyFilters, hasActiveFilters } from './filters'
import { rankIssues } from './ranking'
import { fetchCandidateIssues } from './search'

export type IssuePageData = IssueListPage

export type IssuePageError = { error: 'rate_limited' } | { error: 'unauthorized' } | { error: 'all_failed' }

type FetchIssueListPageParams = {
    userId: string
    accessToken: string
    profile: OnboardingProfile
    filters: IssueFilters
    offset: number
    batchParam: string
}


export async function fetchIssueListPage({
    userId,
    accessToken,
    profile,
    filters,
    offset,
    batchParam,
}: FetchIssueListPageParams): Promise<IssuePageData | IssuePageError> {
    const afterCursors = batchParam === INITIAL_BATCH
        ? {}
        : (decodeBatch<Record<string, string | null>>(batchParam) ?? {})

    // 배치별로 캐시 분리 — 같은 언어 조합이라도 batch가 다르면 별도 GitHub 호출
    // MIN_CANDIDATE_REPO_STARS를 키에 포함 — 값이 바뀌면 기존 캐시를 무효화
    const getCachedIssues = unstable_cache(
        () => fetchCandidateIssues(profile.topLanguages, accessToken, afterCursors),
        ['github-issues', String(MIN_CANDIDATE_REPO_STARS), ...profile.topLanguages.slice().sort(), batchParam],
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
    if (searchResult.unauthorized && searchResult.issues.length === 0) {
        return { error: 'unauthorized' }
    }
    if (searchResult.failedQueryCount === searchResult.totalQueryCount && searchResult.totalQueryCount > 0) {
        return { error: 'all_failed' }
    }

    // 이슈 채점·정렬 후 북마크 여부 병합
    const bookmarkKeys = new Set(bookmarkKeyList)
    const randomSeed = `${userId}:${batchParam}`
    const rankedIssues = rankIssues(searchResult.issues, profile, randomSeed).map((issue) => ({
        ...issue,
        isBookmarked: bookmarkKeys.has(`${issue.repoFullName}#${issue.number}`),
    }))

    // 필터 적용 전 언어 목록 수집 — 필터 적용 여부와 무관하게 사용 가능한 언어 전달
    const availableLanguages = [...new Set(
        rankedIssues.flatMap((i) => i.language !== null ? [i.language] : [])
    )]

    const allIssues = applyFilters(rankedIssues, filters)
    const pageIssues = allIssues.slice(offset, offset + PAGE_SIZE)

    // 현재 배치 캐시 소진 여부 판단 — offset이 캐시 끝에 도달하면 마지막 페이지
    const isLastPage = offset + PAGE_SIZE >= allIssues.length

    // nextBatch는 자동 무한스크롤과 수동 후보 조회가 함께 쓰는 GitHub 배치 커서다.
    // 필터 결과가 한 페이지를 못 채우면 자동 요청은 멈추고, 클라이언트가 버튼으로만 이어서 조회한다.
    const isActiveFilterResultUnderfilled = hasActiveFilters(filters) && pageIssues.length < PAGE_SIZE
    const canAutoRequestNextBatch = searchResult.hasMoreOnGithub && !isActiveFilterResultUnderfilled

    const candidateNextBatch = isLastPage && searchResult.hasMoreOnGithub
        ? encodeBatch(searchResult.endCursors)
        : null

    return {
        issues: pageIssues,
        total: allIssues.length,
        hasMore: !isLastPage || canAutoRequestNextBatch,
        offset,
        batch: batchParam,
        nextBatch: candidateNextBatch,
        canLoadMoreCandidates: candidateNextBatch !== null && !canAutoRequestNextBatch,
        availableLanguages,
        partialResults: searchResult.failedQueryCount > 0,
        failedQueryCount: searchResult.failedQueryCount,
    }
}
