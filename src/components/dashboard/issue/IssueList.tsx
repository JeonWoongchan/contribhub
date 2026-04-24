'use client'

import Link from 'next/link'
import { DataListState } from '@/components/shared/DataListState'
import { useIssueList } from '@/hooks/useIssueList'
import { IssueListContent } from './IssueListContent'

export function IssueList() {
  const state = useIssueList()

  return (
    <DataListState
      status={state.status}
      items={state.status === 'done' ? state.issues : []}
      errorMessage={state.status === 'error' ? state.message : undefined}
      onRetry={state.status === 'error' ? state.refetch : undefined}
      skeletonCount={6}
      emptyTitle="추천할 이슈가 없습니다"
      emptyDescription="프로필 설정이나 GitHub 조회 결과에 따라 지금은 보여드릴 추천 이슈가 없습니다."
      emptyDetail="온보딩 설정을 다시 확인하거나 잠시 후 다시 시도해 주세요."
      emptyAction={<Link href="/onboarding">추천 설정 다시하기</Link>}
      renderContent={(issues) => (
        <IssueListContent
          failedCount={state.status === 'done' ? state.failedCount : 0}
          issues={issues}
          partial={state.status === 'done' ? state.partial : false}
        />
      )}
    />
  )
}
