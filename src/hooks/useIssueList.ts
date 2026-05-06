'use client'

import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { PAGE_SIZE } from '@/constants/scoring-rules'
import { INITIAL_BATCH } from '@/lib/github/batch'
import { fetchApi } from '@/lib/fetch-api'
import type { IssueFilters, ScoredIssue } from '@/types/issue'
import { EMPTY_ISSUE_FILTERS } from '@/types/issue'
import type { IssueListPage } from '@/types/api'
import { QUERY_KEYS, toBaseResult, type BaseQueryResult } from './queryKeys'

type IssuePageParam = {
  offset: number
  batch: string
}

function buildIssueListSearchParams({ offset, batch }: IssuePageParam, filters: IssueFilters): URLSearchParams {
  const params = new URLSearchParams({ offset: String(offset) })

  if (batch !== INITIAL_BATCH) {
    params.set('batch', batch)
  }
  if (filters.language) {
    params.set('language', filters.language)
  }
  if (filters.difficultyLevel) {
    params.set('difficultyLevel', filters.difficultyLevel)
  }
  for (const type of filters.contributionTypes) {
    params.append('contributionTypes', type)
  }
  if (filters.minScore !== null) {
    params.set('minScore', String(filters.minScore))
  }
  if (filters.minStars !== null) {
    params.set('minStars', String(filters.minStars))
  }

  return params
}

export type UseIssueListResult = BaseQueryResult & {
  issues: ScoredIssue[]
  hasNextPage: boolean
  fetchNextPageAction: () => void
  fetchMoreCandidatesAction: () => Promise<void>
  isFetchingNextPage: boolean
  canLoadMoreCandidates: boolean
  partial: boolean
  failedCount: number
  availableLanguages: string[]
}

const DEFAULT_ERROR_MESSAGE = '오류가 발생했습니다.'

export function useIssueList(filters: IssueFilters = EMPTY_ISSUE_FILTERS): UseIssueListResult {
  const query = useInfiniteQuery({
    queryKey: [...QUERY_KEYS.issues, filters.language, filters.difficultyLevel, filters.contributionTypes, filters.minScore, filters.minStars],
    queryFn: ({ pageParam }) => {
      const params = buildIssueListSearchParams(pageParam as IssuePageParam, filters)

      return fetchApi<IssueListPage>(`/api/github/issues?${params}`, DEFAULT_ERROR_MESSAGE)
    },
    initialPageParam: { offset: 0, batch: INITIAL_BATCH } as IssuePageParam,
    getNextPageParam: (lastPage): IssuePageParam | undefined => {
      const nextOffset = lastPage.offset + PAGE_SIZE

      if (nextOffset < lastPage.total) {
        return { offset: nextOffset, batch: lastPage.batch }
      }
      if (lastPage.nextBatch) {
        return { offset: 0, batch: lastPage.nextBatch }
      }

      return undefined
    },
  })

  const issues = useMemo(() => {
    const seen = new Set<string>()

    return (query.data?.pages.flatMap((page) => page.issues) ?? []).filter((issue) => {
      if (seen.has(issue.url)) {
        return false
      }

      seen.add(issue.url)
      return true
    })
  }, [query.data])

  const availableLanguages = useMemo(() => {
    const languages = new Set<string>()
    query.data?.pages.forEach((page) => page.availableLanguages.forEach((language) => languages.add(language)))
    return [...languages].sort()
  }, [query.data])

  const lastPage = query.data?.pages.at(-1)
  const hasAutoNextPage = Boolean(lastPage?.hasMore && query.hasNextPage)
  const canLoadMoreCandidates = Boolean(lastPage?.canLoadMoreCandidates && query.hasNextPage)

  return {
    ...toBaseResult(query, DEFAULT_ERROR_MESSAGE),
    issues,
    hasNextPage: hasAutoNextPage,
    fetchNextPageAction: () => {
      if (hasAutoNextPage) void query.fetchNextPage()
    },
    fetchMoreCandidatesAction: async () => {
      if (canLoadMoreCandidates) await query.fetchNextPage()
    },
    isFetchingNextPage: query.isFetchingNextPage,
    canLoadMoreCandidates,
    partial: lastPage?.partialResults ?? false,
    failedCount: lastPage?.failedQueryCount ?? 0,
    availableLanguages,
  }
}
