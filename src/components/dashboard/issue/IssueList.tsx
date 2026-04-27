'use client'

import Link from 'next/link'
import { DataListState } from '@/components/shared/DataListState'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useIssueBookmarks } from '@/hooks/useIssueBookmarks'
import { useIssueList } from '@/hooks/useIssueList'
import { IssueListContent } from './IssueListContent'

export function IssueList() {
  const { issues, partial, failedCount, isPending, isError, errorMessage, refetch } = useIssueList()
  const { optimisticIssues, pendingBookmarkKeys, toggleBookmark } = useIssueBookmarks({
    sourceIssues: issues,
    isSourceIssuesReady: !isPending && !isError,
  })
  const { visibleItems, sentinelRef, hasMore } = useInfiniteScroll(optimisticIssues)

  return (
    <>
      <DataListState
        isPending={isPending}
        isError={isError}
        items={optimisticIssues}
        errorMessage={errorMessage}
        onRetry={refetch}
        skeletonCount={6}
        emptyTitle="추천할 이슈가 없습니다"
        emptyDescription="프로필 설정이나 GitHub 조회 결과에 따라 지금은 보여드릴 추천 이슈가 없습니다."
        emptyDetail="온보딩 설정을 다시 확인하거나 잠시 후 다시 시도해 주세요."
        emptyAction={<Link href="/onboarding">온보딩 다시하기</Link>}
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
    </>
  )
}
