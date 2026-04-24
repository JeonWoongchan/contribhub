'use client'

import type { Bookmark } from '@/types/bookmark'

type BookmarksState =
  | { status: 'loading' }
  | { status: 'error'; message: string; refetch: () => void }
  | { status: 'done'; bookmarks: Bookmark[] }

export function useBookmarks(): BookmarksState {
  function refetch() {
    return
  }

  void refetch

  return {
    status: 'done',
    bookmarks: [],
  }
}
