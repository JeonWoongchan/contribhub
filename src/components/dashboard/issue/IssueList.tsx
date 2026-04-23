'use client'

import { IssueListContent } from '@/components/dashboard/issue/IssueListContent'
import { IssueListError } from '@/components/dashboard/issue/IssueListError'
import { IssueListSkeleton } from '@/components/dashboard/issue/IssueListSkeleton'
import { useIssueList } from '@/hooks/useIssueList'

export function IssueList() {
  const state = useIssueList()

  if (state.status === 'loading') {
    return <IssueListSkeleton />
  }

  if (state.status === 'error') {
    return <IssueListError message={state.message} onRetry={state.refetch} />
  }

  return (
    <IssueListContent
      failedCount={state.failedCount}
      issues={state.issues}
      partial={state.partial}
    />
  )
}
