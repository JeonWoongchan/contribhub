'use client'

import { AsyncListState } from '@/components/shared/AsyncListState'
import { CardListError } from '@/components/shared/CardListError'
import { CardListSkeleton } from '@/components/shared/CardListSkeleton'
import { CardListEmpty } from '@/components/shared/CardListEmpty'
import { useBookmarks } from '@/hooks/useBookmarks'
import { BookmarkListContent } from './BookmarkListContent'
import Link from "next/link";

export function BookmarkList() {
  const state = useBookmarks()

  return (
    <AsyncListState
      status={state.status}
      isEmpty={state.status === 'done' && state.bookmarks.length === 0}
      loadingFallback={<CardListSkeleton count={4} />}
      errorFallback={
        state.status === 'error' ? (
          <CardListError message={state.message} onRetry={state.refetch} />
        ) : null
      }
      emptyFallback={
        <CardListEmpty
          title="저장한 북마크가 없습니다"
          description="대시보드에서 관심 있는 이슈를 저장하면 이곳에서 진행 상태와 PR 링크를 관리할 수 있습니다."
          detail="북마크는 탐색한 이슈를 개인 작업 큐로 옮기는 역할을 합니다."
          action={<Link href="/dashboard">추천 이슈 보러가기</Link>}
        />
      }
    >
      {state.status === 'done' ? (
        <BookmarkListContent
          bookmarks={state.bookmarks}
        />
      ) : null}
    </AsyncListState>
  )
}
