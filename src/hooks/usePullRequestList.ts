'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/fetch-api'
import type { PullRequestItem, PullRequestState, PullRequestSummary } from '@/types/pull-request'
import { QUERY_KEYS, toBaseResult, type BaseQueryResult } from './queryKeys'

type PRListData = {
    items: PullRequestItem[]
    summary: PullRequestSummary
}

export type UsePullRequestListResult = BaseQueryResult & {
    items: PullRequestItem[]
    summary: PullRequestSummary | undefined
    stateFilter: PullRequestState | null
    setStateFilter: (state: PullRequestState | null) => void
}

const DEFAULT_ERROR = 'PR 목록을 불러오지 못했습니다.'

const fetchPullRequests = () => fetchApi<PRListData>('/api/github/pull-requests', DEFAULT_ERROR)

// 탭 전환은 서버 재요청 없이 목록에서 필터링
function filterByState(items: PullRequestItem[], stateFilter: PullRequestState | null): PullRequestItem[] {
    if (stateFilter === null) return items
    return items.filter((item) => item.state === stateFilter)
}

export function usePullRequestList(): UsePullRequestListResult {
    const [stateFilter, setStateFilter] = useState<PullRequestState | null>(null)

    const query = useQuery({
        queryKey: QUERY_KEYS.pullRequests,
        queryFn: fetchPullRequests,
    })

    const items = useMemo(
        () => filterByState(query.data?.items ?? [], stateFilter),
        [query.data, stateFilter],
    )

    return {
        ...toBaseResult(query, DEFAULT_ERROR),
        items,
        summary: query.data?.summary,
        stateFilter,
        setStateFilter,
    }
}
