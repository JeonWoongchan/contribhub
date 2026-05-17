'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchBarRow } from '@/components/shared/SearchBarRow'
import { SearchDataListState } from '@/components/shared/SearchDataListState'
import { InfiniteScrollTrigger } from '@/components/shared/InfiniteScrollTrigger'
import { DashboardHelpDialog } from '@/components/dashboard/dashboard-help/DashboardHelpDialog'
import { useIssueListView } from '@/hooks/useIssueListView'
import { useToast } from '@/hooks/use-toast'
import { EMPTY_ISSUE_FILTERS } from '@/types/issue'
import type { IssueFilters, IssueCardItem } from '@/types/issue'
import { IssueCandidateLoadMoreNotice } from './IssueCandidateLoadMoreNotice'
import { IssueListContent } from './IssueListContent'
import { IssueListFilter } from './IssueListFilter'

type IssueListProps = {
    // 서버 컴포넌트에서 auth()로 확인한 게스트 여부 — useSession() 클라이언트 캐시 의존을 피함
    isGuest: boolean
}

export function IssueList({ isGuest }: IssueListProps) {
    const [filters, setFilters] = useState<IssueFilters>(EMPTY_ISSUE_FILTERS)
    const [query, setQuery] = useState('')
    const { toast } = useToast()

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

    // 게스트 북마크 클릭 시 토스트 안내 후 차단
    async function handleToggleBookmark(issue: IssueCardItem) {
        if (isGuest) {
            toast({ title: '로그인 후 이용 가능한 기능이에요.' })
            return
        }
        await toggleBookmark(issue)
    }

    return (
        <div className="flex flex-col gap-4">
            {isGuest && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    <span>지금은 기본 추천 이슈를 보여드리고 있어요.</span>
                    <Link
                        href="/login"
                        className="font-medium text-interactive-action underline-offset-4 hover:underline"
                    >
                        로그인하고 나에게 맞는 이슈를 추천받아보세요.
                    </Link>
                </div>
            )}

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
                    action: isGuest
                        ? <Link href="/login">로그인하여 맞춤 추천 받기</Link>
                        : <Link href="/onboarding">온보딩 다시하기</Link>,
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
                        onToggleBookmark={handleToggleBookmark}
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
