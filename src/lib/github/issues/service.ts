import { unstable_cache } from 'next/cache'
import { after } from 'next/server'

import { listUserBookmarkKeys } from '@/lib/bookmarks'
import { encodeBatch, INITIAL_BATCH, normalizeBatchCursors, parseBatchParam } from '@/lib/github/batch'
import { GITHUB_API_CACHE_TTL_SECONDS, MIN_CANDIDATE_REPO_STARS, PAGE_SIZE } from '@/constants/scoring-rules'
import type { IssueFilters } from '@/types/issue'
import type { IssueListPage } from '@/types/api'
import type { OnboardingProfile } from '@/lib/user/profile'
import { applyFilters, hasActiveFilters } from './filters'
import { rankIssues } from './ranking'
import { fetchCandidateIssues } from './search'

export type IssuePageData = IssueListPage

export type IssuePageError =
    | { error: 'invalid_batch' }
    | { error: 'rate_limited' }
    | { error: 'unauthorized' }
    | { error: 'all_failed' }

type FetchIssueListPageParams = {
    userId: string | null  // null = 게스트. 북마크 조회를 생략하고 공유 캐시를 사용한다.
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
    const parsedBatch = parseBatchParam(batchParam)
    if (!parsedBatch.ok) {
        return { error: 'invalid_batch' }
    }

    const normalizedCursors = normalizeBatchCursors(parsedBatch.afterCursors, profile.topLanguages)
    if (parsedBatch.batchParam !== INITIAL_BATCH && Object.keys(normalizedCursors).length === 0) {
        return { error: 'invalid_batch' }
    }

    const afterCursors = normalizedCursors
    const canonicalBatchParam = parsedBatch.batchParam === INITIAL_BATCH
        ? parsedBatch.batchParam
        : encodeBatch(normalizedCursors)

    const cacheUserId = userId ?? 'guest'

    const getCachedIssues = unstable_cache(
        () => fetchCandidateIssues(profile.topLanguages, accessToken, afterCursors),
        [
            'github-issues',
            cacheUserId,
            String(MIN_CANDIDATE_REPO_STARS),
            ...profile.topLanguages.slice().sort(),
            canonicalBatchParam,
        ],
        { revalidate: GITHUB_API_CACHE_TTL_SECONDS }
    )

    const [searchResult, bookmarkKeyList] = await Promise.all([
        getCachedIssues(),
        userId ? listUserBookmarkKeys(userId) : Promise.resolve([]),
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

    const bookmarkKeys = new Set(bookmarkKeyList)
    const rankedIssues = rankIssues(searchResult.issues, profile).map((issue) => ({
        ...issue,
        isBookmarked: bookmarkKeys.has(`${issue.repoFullName}#${issue.number}`),
    }))

    const availableLanguages = [...new Set(
        rankedIssues.flatMap((issue) => issue.language !== null ? [issue.language] : [])
    )]

    const allIssues = applyFilters(rankedIssues, filters)
    const pageIssues = allIssues.slice(offset, offset + PAGE_SIZE)
    const isLastPage = offset + PAGE_SIZE >= allIssues.length

    const isActiveFilterResultUnderfilled = hasActiveFilters(filters) && pageIssues.length < PAGE_SIZE
    const canAutoRequestNextBatch = searchResult.hasMoreOnGithub && !isActiveFilterResultUnderfilled

    const candidateNextBatch = isLastPage && searchResult.hasMoreOnGithub
        ? encodeBatch(searchResult.endCursors)
        : null

    const isFirstPage = offset === 0
    if (isFirstPage && searchResult.hasMoreOnGithub) {
        const nextBatchCursors = searchResult.endCursors
        const nextBatchParam = encodeBatch(nextBatchCursors)
        const prefetchNextBatch = unstable_cache(
            () => fetchCandidateIssues(profile.topLanguages, accessToken, nextBatchCursors),
            [
                'github-issues',
                cacheUserId,
                String(MIN_CANDIDATE_REPO_STARS),
                ...profile.topLanguages.slice().sort(),
                nextBatchParam,
            ],
            { revalidate: GITHUB_API_CACHE_TTL_SECONDS }
        )
        after(() => { void prefetchNextBatch() })
    }

    return {
        issues: pageIssues,
        total: allIssues.length,
        hasMore: !isLastPage || canAutoRequestNextBatch,
        offset,
        batch: canonicalBatchParam,
        nextBatch: candidateNextBatch,
        canLoadMoreCandidates: candidateNextBatch !== null && !canAutoRequestNextBatch,
        availableLanguages,
        partialResults: searchResult.failedQueryCount > 0,
        failedQueryCount: searchResult.failedQueryCount,
    }
}
