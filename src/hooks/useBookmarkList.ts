'use client'

import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/fetch-api'
import type { IssueCardItem } from '@/types/issue'
import type { BookmarkListPage } from '@/types/api'
import { ISSUE_LIST_STALE_TIME_MS } from '@/constants/scoring-rules'
import { QUERY_KEYS, toBaseResult, type BaseQueryResult } from './queryKeys'

export type UseBookmarkListResult = BaseQueryResult & {
  issues: IssueCardItem[]
  hasNextPage: boolean
  fetchNextPageAction: () => void
  isFetchingNextPage: boolean
}

const DEFAULT_ERROR_MESSAGE = '북마크 목록을 불러오지 못했습니다.'

export function useBookmarkList(): UseBookmarkListResult {
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.bookmarks,
    staleTime: ISSUE_LIST_STALE_TIME_MS,
    queryFn: ({ pageParam }) =>
      fetchApi<BookmarkListPage>(`/api/bookmarks?offset=${pageParam}`, DEFAULT_ERROR_MESSAGE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.offset + lastPage.pageInfo.limit : undefined,
  })

  const issues = useMemo(() => query.data?.pages.flatMap((page) => page.issues) ?? [], [query.data])

  return {
    ...toBaseResult(query, DEFAULT_ERROR_MESSAGE),
    issues,
    hasNextPage: query.hasNextPage,
    fetchNextPageAction: () => {
      void query.fetchNextPage()
    },
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
