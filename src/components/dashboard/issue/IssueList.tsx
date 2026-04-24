'use client'

import Link from 'next/link'
import { AsyncListState } from '@/components/shared/AsyncListState'
import { CardListError } from '@/components/shared/CardListError'
import { CardListSkeleton } from '@/components/shared/CardListSkeleton'
import { CardListEmpty } from '@/components/shared/CardListEmpty'
import { useIssueList } from '@/hooks/useIssueList'
import { IssueListContent } from './IssueListContent'

export function IssueList() {
  const state = useIssueList()

  return (
    <AsyncListState
      status={state.status}
      isEmpty={state.status === 'done' && state.issues.length === 0}
      loadingFallback={<CardListSkeleton count={6} />}
      errorFallback={
        state.status === 'error' ? (
          <CardListError message={state.message} onRetry={state.refetch} />
        ) : null
      }
      emptyFallback={
        <CardListEmpty
          title="추천할 이슈가 없습니다"
          description="프로필 설정이나 GitHub 조회 결과에 따라 지금은 보여드릴 추천 이슈가 없습니다."
          detail="온보딩 설정을 다시 확인하거나 잠시 후 다시 시도해 주세요."
          action={<Link href="/onboarding">온보딩 설정 다시하기</Link>}
        />
      }
    >
      {state.status === 'done' ? (
        <IssueListContent
          failedCount={state.failedCount}
          issues={state.issues}
          partial={state.partial}
        />
      ) : null}
    </AsyncListState>
  )
}
