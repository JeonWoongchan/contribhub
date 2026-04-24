'use client'

import { useEffect, useState } from 'react'
import type { Bookmark } from '@/types/bookmark'

type BookmarkPageInfo = {
  limit: number
  offset: number
  total: number
  hasMore: boolean
}

type BookmarkListResponse =
  | {
      ok: true
      data: {
        bookmarks: Bookmark[]
        pageInfo: BookmarkPageInfo
      }
    }
  | {
      ok: false
      error?: {
        message?: string
      }
    }

type BookmarkListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'done'
      bookmarks: Bookmark[]
      pageInfo: BookmarkPageInfo
    }

type BookmarkListResult = BookmarkListState & {
  refetch: () => void
}

const DEFAULT_ERROR_MESSAGE = '북마크 목록을 불러오지 못했습니다.'
const NETWORK_ERROR_MESSAGE = '네트워크 오류가 발생했습니다.'

export function useBookmarkList(): BookmarkListResult {
  const [requestId, setRequestId] = useState(0)
  const [state, setState] = useState<BookmarkListState>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    async function fetchBookmarks() {
      setState({ status: 'loading' })

      try {
        const response = await fetch('/api/bookmarks', { signal: controller.signal })
        const json = (await response.json()) as BookmarkListResponse

        if (!json.ok) {
          setState({ status: 'error', message: json.error?.message ?? DEFAULT_ERROR_MESSAGE })
          return
        }

        setState({
          status: 'done',
          bookmarks: json.data.bookmarks,
          pageInfo: json.data.pageInfo,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setState({ status: 'error', message: NETWORK_ERROR_MESSAGE })
      }
    }

    void fetchBookmarks()

    return () => {
      controller.abort()
    }
  }, [requestId])

  function refetch() {
    setRequestId((value) => value + 1)
  }

  return {
    ...state,
    refetch,
  }
}
