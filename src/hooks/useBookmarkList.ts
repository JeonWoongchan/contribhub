'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/fetch-api'
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

export type UseBookmarkListResult = {
    issues: IssueCardItem[]
    pageInfo: BookmarkPageInfo | undefined
    isPending: boolean
    isError: boolean
    errorMessage: string
    refetch: () => void
}

const DEFAULT_ERROR_MESSAGE = '북마크 목록을 불러오지 못했습니다.'

const fetchBookmarks = () => fetchApi<BookmarkListData>('/api/bookmarks', DEFAULT_ERROR_MESSAGE)

export function useBookmarkList(): UseBookmarkListResult {
    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.bookmarks,
        queryFn: fetchBookmarks,
    })

    return {
        issues: data?.issues ?? [],
        pageInfo: data?.pageInfo,
        isPending,
        isError,
        errorMessage: isError && error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
        refetch: () => { void refetch() },
    }
}
