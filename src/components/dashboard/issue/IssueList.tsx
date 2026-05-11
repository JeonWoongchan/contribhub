'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchBarRow } from '@/components/shared/SearchBarRow'
import { SearchDataListState } from '@/components/shared/SearchDataListState'
import { InfiniteScrollTrigger } from '@/components/shared/InfiniteScrollTrigger'
import { DashboardHelpDialog } from '@/components/dashboard/dashboard-help/DashboardHelpDialog'
import { useIssueListView } from '@/hooks/useIssueListView'
import { EMPTY_ISSUE_FILTERS } from '@/types/issue'
import type { IssueFilters } from '@/types/issue'
import { IssueCandidateLoadMoreNotice } from './IssueCandidateLoadMoreNotice'
import { IssueListContent } from './IssueListContent'
import { IssueListFilter } from './IssueListFilter'

export function IssueList() {
    const [filters, setFilters] = useState<IssueFilters>(EMPTY_ISSUE_FILTERS)
    const [query, setQuery] = useState('')

    const {
        filterAvailableLanguages,
        filteredItems,
        totalCount,
        isPending,
        isError,
        errorMessage,
        refetch,
        displayItems,
        partial,
        failedCount,
        toggleBookmark,
        effectiveHasNextPage,
        isFetchingNextPage,
        sentinelRef,
        shouldShowCandidateLoadMoreNotice,
        emptyCandidateFetchCount,
        canLoadMoreCandidates,
        loadMoreCandidatesAction,
    } = useIssueListView(filters, query)

    return (
        <div className="flex flex-col gap-4">
            <SearchBarRow
                value={query}
                onChangeAction={setQuery}
                resultCount={query ? filteredItems.length : undefined}
                totalCount={query ? totalCount : undefined}
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
                    />
                )}
            />

            <InfiniteScrollTrigger
                hasNextPage={effectiveHasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                sentinelRefAction={sentinelRef}
            />

            {shouldShowCandidateLoadMoreNotice ? (
                <IssueCandidateLoadMoreNotice
                    isLoading={isFetchingNextPage}
                    canLoadMore={canLoadMoreCandidates}
                    emptyFetchCount={emptyCandidateFetchCount}
                    onLoadMoreAction={loadMoreCandidatesAction}
                />
            ) : null}
        </div>
    )
}
