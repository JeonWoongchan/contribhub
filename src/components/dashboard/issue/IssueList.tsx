'use client'

import Link from 'next/link'
import { SearchBar } from '@/components/shared/SearchBar'
import { SearchDataListState } from '@/components/shared/SearchDataListState'
import { DashboardHelpDialog } from '@/components/dashboard/dashboard-help/DashboardHelpDialog'
import { useIssueBookmarks } from '@/hooks/useIssueBookmarks'
import { useIssueList } from '@/hooks/useIssueList'
import { useListSearch } from '@/hooks/useListSearch'
import { IssueListContent } from './IssueListContent'

export function IssueList() {
  const { issues, partial, failedCount, isPending, isError, errorMessage, refetch } = useIssueList()
  const { optimisticIssues, pendingBookmarkKeys, toggleBookmark } = useIssueBookmarks({
    sourceIssues: issues,
    isSourceIssuesReady: !isPending && !isError,
  })
  const { query, setQuery, filteredItems, visibleItems, sentinelRef, hasMore, resultCount } =
    useListSearch(optimisticIssues)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchBar value={query} onChange={setQuery} resultCount={resultCount} className="flex-1" />
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
        items={filteredItems}
        errorMessage={errorMessage}
        onRetry={refetch}
        skeletonCount={6}
        renderContent={() => (
          <IssueListContent
            issues={visibleItems}
            partial={partial}
            failedCount={failedCount}
            onToggleBookmark={toggleBookmark}
            pendingBookmarkKeys={pendingBookmarkKeys}
          />
        )}
      />
      {hasMore && <div ref={sentinelRef} className="h-10" />}
    </div>
  )
}
