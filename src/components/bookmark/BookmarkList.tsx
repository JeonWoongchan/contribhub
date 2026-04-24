'use client'

import Link from 'next/link'
import { DataListState } from '@/components/shared/DataListState'
import { useBookmarks } from '@/hooks/useBookmarks'
import { BookmarkListContent } from './BookmarkListContent'

export function BookmarkList() {
  const state = useBookmarks()

  return (
    <DataListState
      status={state.status}
      items={state.status === 'done' ? state.bookmarks : []}
      errorMessage={state.status === 'error' ? state.message : undefined}
      onRetry={state.status === 'error' ? state.refetch : undefined}
      skeletonCount={4}
      emptyTitle="저장한 북마크가 없습니다"
      emptyDescription="대시보드에서 관심 있는 이슈를 저장하면 이곳에서 진행 상태와 PR 링크를 관리할 수 있습니다."
      emptyDetail="북마크는 탐색한 이슈를 개인 작업 큐로 옮기는 역할을 합니다."
      emptyAction={<Link href="/dashboard">추천 이슈 보러가기</Link>}
      renderContent={(bookmarks) => <BookmarkListContent bookmarks={bookmarks} />}
    />
  )
}
