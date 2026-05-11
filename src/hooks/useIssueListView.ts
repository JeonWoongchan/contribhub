'use client'

import { useEffect, useState } from 'react'
import { useIssueBookmarks } from './useIssueBookmarks'
import { useIssueCandidateLoadMoreFeedback } from './useIssueCandidateLoadMoreFeedback'
import { useIssueList } from './useIssueList'
import { useSearchFilter } from './useSearchFilter'
import { useInfiniteScrollDisplay } from './useScrollSentinel'
import type { IssueFilters } from '@/types/issue'

export function useIssueListView(filters: IssueFilters, query: string) {
    const {
        issues,
        hasNextPage,
        fetchNextPageAction,
        fetchMoreCandidatesAction,
        isFetchingNextPage,
        canLoadMoreCandidates,
        isPending,
        isError,
        errorMessage,
        refetch,
        partial,
        failedCount,
        availableLanguages,
    } = useIssueList(filters)

    // 로딩 중에도 언어 필터 옵션이 사라지지 않도록 마지막 성공값을 유지
    const [lastAvailableLanguages, setLastAvailableLanguages] = useState<string[]>([])

    useEffect(() => {
        if (!isPending && !isError) {
            setLastAvailableLanguages(availableLanguages)
        }
    }, [availableLanguages, isError, isPending])

    const filterAvailableLanguages =
        isPending && lastAvailableLanguages.length > 0 ? lastAvailableLanguages : availableLanguages

    const { optimisticIssues, pendingBookmarkKeys, toggleBookmark } = useIssueBookmarks({
        sourceIssues: issues,
        isSourceIssuesReady: !isPending && !isError,
    })

    const filteredItems = useSearchFilter(optimisticIssues, query)
    const { displayItems, effectiveHasNextPage, sentinelRef } = useInfiniteScrollDisplay({
        items: filteredItems,
        hasNextPage,
        fetchNextPageAction,
        isFetchingNextPage,
        isSearchActive: !!query,
    })

    const {
        emptyCandidateFetchCount,
        shouldShowCandidateLoadMoreNotice,
        loadMoreCandidatesAction,
    } = useIssueCandidateLoadMoreFeedback({
        filters,
        issueCount: issues.length,
        isFetchingNextPage,
        canLoadMoreCandidates,
        fetchMoreCandidatesAction,
    })

    return {
        filterAvailableLanguages,
        filteredItems,
        totalCount: optimisticIssues.length,
        isPending,
        isError,
        errorMessage,
        refetch,
        displayItems,
        partial,
        failedCount,
        toggleBookmark,
        pendingBookmarkKeys,
        effectiveHasNextPage,
        isFetchingNextPage,
        sentinelRef,
        shouldShowCandidateLoadMoreNotice,
        emptyCandidateFetchCount,
        canLoadMoreCandidates,
        loadMoreCandidatesAction,
    }
}
