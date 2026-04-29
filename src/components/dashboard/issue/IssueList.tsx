'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchBar } from '@/components/shared/SearchBar'
import { SearchDataListState } from '@/components/shared/SearchDataListState'
import { InfiniteScrollTrigger } from '@/components/shared/InfiniteScrollTrigger'
import { DashboardHelpDialog } from '@/components/dashboard/dashboard-help/DashboardHelpDialog'
import { useIssueBookmarks } from '@/hooks/useIssueBookmarks'
import { useIssueList } from '@/hooks/useIssueList'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { useInfiniteScrollDisplay } from '@/hooks/useScrollSentinel'
import { IssueListContent } from './IssueListContent'

export function IssueList() {
    const {
        issues,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        isPending,
        isError,
        errorMessage,
        refetch,
        partial,
        failedCount,
    } = useIssueList()

    const { optimisticIssues, pendingBookmarkKeys, toggleBookmark } = useIssueBookmarks({
        sourceIssues: issues,
        isSourceIssuesReady: !isPending && !isError,
    })

    const [query, setQuery] = useState('')
    const filteredItems = useSearchFilter(optimisticIssues, query)
    const { displayItems, sentinelRef } = useInfiniteScrollDisplay({
        items: filteredItems,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    resultCount={query ? filteredItems.length : undefined}
                    className="flex-1"
                />
                <DashboardHelpDialog />
            </div>

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
                items={displayItems}
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
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                sentinelRef={sentinelRef}
            />
        </div>
    )
}
