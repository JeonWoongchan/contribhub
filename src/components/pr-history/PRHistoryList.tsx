// PR 히스토리 오케스트레이터 — 훅 연결, 요약 통계 + 검색 + 필터 + 목록 조합
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchBarRow } from '@/components/shared/SearchBarRow'
import { PRHistoryHelpDialog } from './pr-history-help/PRHistoryHelpDialog'
import { SearchDataListState } from '@/components/shared/SearchDataListState'
import { InfiniteScrollTrigger } from '@/components/shared/InfiniteScrollTrigger'
import { usePullRequestList } from '@/hooks/usePullRequestList'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { useInfiniteScrollDisplay } from '@/hooks/useScrollSentinel'
import { PRHistoryContent } from './PRHistoryContent'
import { PRStateFilter } from './PRStateFilter'
import { PRSummaryStats } from './PRSummaryStats'
import { PRSummaryStatsSkeleton } from './PRSummaryStatsSkeleton'

export function PRHistoryList() {
    const {
        items,
        summary,
        isPending,
        isError,
        errorMessage,
        stateFilter,
        setStateFilter,
        refetch,
        hasNextPage,
        fetchNextPageAction,
        isFetchingNextPage,
    } = usePullRequestList()

    const [query, setQuery] = useState('')
    // 상태 필터 결과에 텍스트 검색을 이어서 적용 (AND 조합)
    const filteredItems = useSearchFilter(items, query)
    const { displayItems, effectiveHasNextPage, sentinelRef } = useInfiniteScrollDisplay({
        items: filteredItems,
        hasNextPage,
        fetchNextPageAction,
        isFetchingNextPage,
        isSearchActive: !!query,
    })

    return (
        <div className="flex flex-col gap-6">
            {/* 로딩 중에도 통계 영역 크기를 유지해 SearchBar 위치 고정 */}
            {isPending ? <PRSummaryStatsSkeleton /> : summary ? <PRSummaryStats summary={summary} /> : null}

            <div className="flex flex-col gap-3">
                <SearchBarRow
                    value={query}
                    onChangeAction={setQuery}
                    resultCount={query ? filteredItems.length : undefined}
                    totalCount={query ? items.length : undefined}
                    placeholder="PR 제목 또는 레포명 검색"
                    helpSlot={<PRHistoryHelpDialog />}
                />
                <PRStateFilter current={stateFilter} onChangeAction={setStateFilter} />
            </div>

            <SearchDataListState
                query={query}
                entityLabel="PR"
                fallback={{
                    title: 'PR 기록이 없습니다',
                    description: '아직 GitHub에 제출한 Pull Request가 없습니다.',
                    detail: '오픈소스 프로젝트에 기여해 보세요.',
                    action: <Link href="/dashboard">추천 이슈 보러가기</Link>,
                }}
                isPending={isPending}
                isError={isError}
                items={filteredItems}
                errorMessage={errorMessage}
                onRetry={refetch}
                skeletonCount={10}
                renderContent={() => <PRHistoryContent items={displayItems} />}
            />

            <InfiniteScrollTrigger
                hasNextPage={effectiveHasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                sentinelRef={sentinelRef}
            />
        </div>
    )
}
