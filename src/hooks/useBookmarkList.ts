'use client'

import { useQuery } from '@tanstack/react-query'
import type { IssueCardItem } from '@/types/issue'
import { QUERY_KEYS } from './queryKeys'

type BookmarkPageInfo = {
    limit: number
    offset: number
    total: number
    hasMore: boolean
}

type BookmarkListData = {
    issues: IssueCardItem[]
    pageInfo: BookmarkPageInfo
}

type BookmarkListResponse =
    | { ok: true; data: BookmarkListData }
    | { ok: false; error?: { message?: string } }

type BookmarkListState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'done'; issues: IssueCardItem[]; pageInfo: BookmarkPageInfo }

type BookmarkListResult = BookmarkListState & { refetch: () => void }

const DEFAULT_ERROR_MESSAGE = '북마크 목록을 불러오지 못했습니다.'

async function fetchBookmarks(): Promise<BookmarkListData> {
    const res = await fetch('/api/bookmarks')
    const json = (await res.json()) as BookmarkListResponse
    if (!json.ok) throw new Error(json.error?.message ?? DEFAULT_ERROR_MESSAGE)
    return json.data
}

export function useBookmarkList(): BookmarkListResult {
    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.bookmarks,
        queryFn: fetchBookmarks,
    })

    function doRefetch() {
        void refetch()
    }

    if (isPending) return { status: 'loading', refetch: doRefetch }
    if (isError) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
            refetch: doRefetch,
        }
    }

    return {
        status: 'done',
        issues: data.issues,
        pageInfo: data.pageInfo,
        refetch: doRefetch,
    }
}
