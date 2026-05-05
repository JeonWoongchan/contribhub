'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SearchBarRow } from '@/components/shared/SearchBarRow'
import { SearchDataListState } from '@/components/shared/SearchDataListState'
import { InfiniteScrollTrigger } from '@/components/shared/InfiniteScrollTrigger'
import { DashboardHelpDialog } from '@/components/dashboard/dashboard-help/DashboardHelpDialog'
import { useIssueBookmarks } from '@/hooks/useIssueBookmarks'
import { useIssueList } from '@/hooks/useIssueList'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { useInfiniteScrollDisplay } from '@/hooks/useScrollSentinel'
import { EMPTY_ISSUE_FILTERS } from '@/types/issue'
import type { IssueFilters } from '@/types/issue'
import { IssueListContent } from './IssueListContent'
import { IssueListFilter } from './IssueListFilter'

export function IssueList() {
    const [filters, setFilters] = useState<IssueFilters>(EMPTY_ISSUE_FILTERS)

    const {
        issues,
        hasNextPage,
        fetchNextPageAction,
        isFetchingNextPage,
        isPending,
        isError,
        errorMessage,
        refetch,
        partial,
        failedCount,
        availableLanguages,
    } = useIssueList(filters)

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

    const [query, setQuery] = useState('')
    const filteredItems = useSearchFilter(optimisticIssues, query)
    const { displayItems, effectiveHasNextPage, sentinelRef } = useInfiniteScrollDisplay({
        items: filteredItems,
        hasNextPage,
        fetchNextPageAction,
        isFetchingNextPage,
        isSearchActive: !!query,
    })

    return (
        <div className="flex flex-col gap-4">
            <SearchBarRow
                value={query}
                onChangeAction={setQuery}
                resultCount={query ? filteredItems.length : undefined}
                totalCount={query ? optimisticIssues.length : undefined}
                helpSlot={<DashboardHelpDialog />}
            />

            <IssueListFilter
                filters={filters}
                availableLanguages={filterAvailableLanguages}
                onChangeAction={setFilters}
            />

            <SearchDataListState
                query={query}
                entityLabel="이슈"
                fallback={{
                    title: '추천할 이슈가 없습니다',
                    description: '프로필 설정이나 GitHub 조회 결과에 따라 지금은 보여드릴 추천 이슈가 없습니다.',
                    detail: '온보딩 설정을 다시 확인하거나 잠시 후 다시 시도해 주세요.',
                    action: <Link href="/onboarding">온보딩 다시하기</Link>,
                }}
                isPending={isPending}
                isError={isError}
                items={filteredItems}
                errorMessage={errorMessage}
                onRetry={refetch}
                skeletonCount={10}
                renderContent={() => (
                    <IssueListContent
                        issues={displayItems}
                        partial={partial}
                        failedCount={failedCount}
                        onToggleBookmark={toggleBookmark}
                        pendingBookmarkKeys={pendingBookmarkKeys}
                    />
                )}
            />

            <InfiniteScrollTrigger
                hasNextPage={effectiveHasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                sentinelRef={sentinelRef}
            />
        </div>
    )
}
