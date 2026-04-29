'use client'

import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/fetch-api'
import type { IssueCardItem } from '@/types/issue'
import { QUERY_KEYS, toBaseResult, type BaseQueryResult } from './queryKeys'

type BookmarkPageInfo = {
    limit: number
    offset: number
    total: number
    hasMore: boolean
}

type BookmarkListPage = {
    issues: IssueCardItem[]
    pageInfo: BookmarkPageInfo
}

export type UseBookmarkListResult = BaseQueryResult & {
    issues: IssueCardItem[]
    hasNextPage: boolean
    fetchNextPage: () => void
    isFetchingNextPage: boolean
}

const DEFAULT_ERROR_MESSAGE = '북마크 목록을 불러오지 못했습니다.'

export function useBookmarkList(): UseBookmarkListResult {
    const query = useInfiniteQuery({
        queryKey: QUERY_KEYS.bookmarks,
        queryFn: ({ pageParam }) =>
            fetchApi<BookmarkListPage>(`/api/bookmarks?offset=${pageParam}`, DEFAULT_ERROR_MESSAGE),
        initialPageParam: 0,
        getNextPageParam: (lastPage) =>
            lastPage.pageInfo.hasMore
                ? lastPage.pageInfo.offset + lastPage.pageInfo.limit
                : undefined,
    })

    const issues = useMemo(
        () => query.data?.pages.flatMap((p) => p.issues) ?? [],
        [query.data],
    )

    return {
        ...toBaseResult(query, DEFAULT_ERROR_MESSAGE),
        issues,
        hasNextPage: query.hasNextPage,
        fetchNextPage: () => { void query.fetchNextPage() },
        isFetchingNextPage: query.isFetchingNextPage,
    }
}
