'use client'

import { useIssueList } from '@/hooks/useIssueList'
import { IssueListContent } from './IssueListContent'
import { IssueListError } from './IssueListError'
import { IssueListSkeleton } from './IssueListSkeleton'

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
