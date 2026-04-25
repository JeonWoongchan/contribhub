'use client'

import Link from 'next/link'
import { DataListState } from '@/components/shared/DataListState'
import { useIssueBookmarks } from '@/hooks/useIssueBookmarks'
import { useIssueList } from '@/hooks/useIssueList'
import { IssueListContent } from './IssueListContent'

export function IssueList() {
  const issueListState = useIssueList()
  const { optimisticIssues, pendingBookmarkKeys, toggleBookmark } = useIssueBookmarks({
    sourceIssues: issueListState.status === 'done' ? issueListState.issues : [],
    isSourceIssuesReady: issueListState.status === 'done',
  })
  return (
    <DataListState
      status={issueListState.status}
      items={issueListState.status === 'done' ? optimisticIssues : []}
      errorMessage={issueListState.status === 'error' ? issueListState.message : undefined}
      onRetry={issueListState.refetch}
      skeletonCount={6}
      emptyTitle="추천할 이슈가 없습니다"
      emptyDescription="프로필 설정이나 GitHub 조회 결과에 따라 지금은 보여드릴 추천 이슈가 없습니다."
      emptyDetail="온보딩 설정을 다시 확인하거나 잠시 후 다시 시도해 주세요."
      emptyAction={<Link href="/onboarding">온보딩 다시하기</Link>}
      renderContent={(loadedIssues) => (
        <IssueListContent
          issues={loadedIssues}
          partial={issueListState.status === 'done' ? issueListState.partial : false}
          failedCount={issueListState.status === 'done' ? issueListState.failedCount : 0}
          onToggleBookmark={toggleBookmark}
          pendingBookmarkKeys={pendingBookmarkKeys}
        />
      )}
    />
  )
}
