'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchBarRow } from '@/components/shared/SearchBarRow'
import { SearchDataListState } from '@/components/shared/SearchDataListState'
import { InfiniteScrollTrigger } from '@/components/shared/InfiniteScrollTrigger'
import { BookmarkHelpDialog } from '@/components/bookmark/bookmark-help/BookmarkHelpDialog'
import { useBookmarkList } from '@/hooks/useBookmarkList'
import { useIssueBookmarks } from '@/hooks/useIssueBookmarks'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { useInfiniteScrollDisplay } from '@/hooks/useScrollSentinel'
import { BookmarkListContent } from './BookmarkListContent'

export function BookmarkList() {
    const {
        issues,
        hasNextPage,
        fetchNextPageAction,
        isFetchingNextPage,
        isPending,
        isError,
        errorMessage,
        refetch,
    } = useBookmarkList()

    const { optimisticIssues, pendingBookmarkKeys, toggleBookmark } = useIssueBookmarks({
        sourceIssues: issues,
        isSourceIssuesReady: !isPending && !isError,
        removeOnUnbookmark: true,
        onMutationSuccessAction: refetch,
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
                helpSlot={<BookmarkHelpDialog />}
            />

            <SearchDataListState
                query={query}
                entityLabel="북마크"
                fallback={{
                    title: '저장한 북마크가 없습니다',
                    description: '대시보드에서 관심 있는 이슈를 저장하면 여기에서 북마크 목록을 확인할 수 있습니다.',
                    detail: '추천 이슈 페이지에서 관심 있는 이슈를 북마크로 추가해 보세요.',
                    action: <Link href="/dashboard">추천 이슈 보러가기</Link>,
                }}
                isPending={isPending}
                isError={isError}
                items={filteredItems}
                errorMessage={errorMessage}
                onRetry={refetch}
                skeletonCount={10}
                renderContent={() => (
                    <BookmarkListContent
                        issues={displayItems}
                        pendingBookmarkKeys={pendingBookmarkKeys}
                        onToggleBookmark={toggleBookmark}
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
