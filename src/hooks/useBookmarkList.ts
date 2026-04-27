'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/fetch-api'
import type { IssueCardItem } from '@/types/issue'
import { QUERY_KEYS, toBaseResult, type BaseQueryResult } from './queryKeys'

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

export type UseBookmarkListResult = BaseQueryResult & {
    issues: IssueCardItem[]
    pageInfo: BookmarkPageInfo | undefined
}

const DEFAULT_ERROR_MESSAGE = '북마크 목록을 불러오지 못했습니다.'

const fetchBookmarks = () => fetchApi<BookmarkListData>('/api/bookmarks', DEFAULT_ERROR_MESSAGE)

export function useBookmarkList(): UseBookmarkListResult {
    const query = useQuery({
        queryKey: QUERY_KEYS.bookmarks,
        queryFn: fetchBookmarks,
    })

    return {
        ...toBaseResult(query, DEFAULT_ERROR_MESSAGE),
        issues: query.data?.issues ?? [],
        pageInfo: query.data?.pageInfo,
    }
}
