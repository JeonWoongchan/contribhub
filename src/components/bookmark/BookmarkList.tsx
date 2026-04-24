'use client'

import Link from 'next/link'
import { DataListState } from '@/components/shared/DataListState'
import { useBookmarkList } from '@/hooks/useBookmarkList'
import { BookmarkListContent } from './BookmarkListContent'

export function BookmarkList() {
  const bookmarkListState = useBookmarkList()

  return (
    <DataListState
      status={bookmarkListState.status}
      items={bookmarkListState.status === 'done' ? bookmarkListState.bookmarks : []}
      errorMessage={bookmarkListState.status === 'error' ? bookmarkListState.message : undefined}
      onRetry={bookmarkListState.refetch}
      skeletonCount={4}
      emptyTitle="저장한 북마크가 없습니다"
      emptyDescription="대시보드에서 관심 있는 이슈를 저장하면 여기에서 북마크 목록을 확인할 수 있습니다."
      emptyDetail="북마크 페이지는 저장한 이슈를 다시 확인하고 관리하는 공간입니다."
      emptyAction={<Link href="/dashboard">추천 이슈 보러가기</Link>}
      renderContent={(bookmarks) => <BookmarkListContent bookmarks={bookmarks} />}
    />
  )
}
