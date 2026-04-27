'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { PullRequestItem, PullRequestState, PullRequestSummary } from '@/types/pull-request'
import { QUERY_KEYS } from './queryKeys'

type PRListData = {
    items: PullRequestItem[]
    summary: PullRequestSummary
}

type PRListResponse =
    | { ok: true; data: PRListData }
    | { ok: false; error?: { message?: string } }

type PRListActions = {
    refetch: () => void
    stateFilter: PullRequestState | null
    setStateFilter: (state: PullRequestState | null) => void
}

// 컴포넌트에 노출되는 훅 반환 타입 — status에 따라 사용 가능한 필드가 달라짐
export type PRListResult =
    | ({ status: 'loading' } & PRListActions)
    | ({ status: 'error'; message: string } & PRListActions)
    | ({ status: 'done'; items: PullRequestItem[]; summary: PullRequestSummary } & PRListActions)

const DEFAULT_ERROR = 'PR 목록을 불러오지 못했습니다.'

async function fetchPullRequests(): Promise<PRListData> {
    const res = await fetch('/api/github/pull-requests')
    const json = (await res.json()) as PRListResponse
    if (!json.ok) throw new Error(json.error?.message ?? DEFAULT_ERROR)
    return json.data
}

// 전체 목록에서 상태별 필터링
function filterByState(
    items: PullRequestItem[],
    stateFilter: PullRequestState | null,
): PullRequestItem[] {
    if (stateFilter === null) return items
    return items.filter((item) => item.state === stateFilter)
}

export function usePullRequestList(): PRListResult {
    // 탭 전환은 서버 재요청 없이 목록에서 필터링
    const [stateFilter, setStateFilter] = useState<PullRequestState | null>(null)

    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.pullRequests,
        queryFn: fetchPullRequests,
    })

    const items = useMemo(
        () => filterByState(data?.items ?? [], stateFilter),
        [data, stateFilter],
    )

    function doRefetch() {
        void refetch()
    }

    const actions: PRListActions = { refetch: doRefetch, stateFilter, setStateFilter }

    if (isPending) return { status: 'loading', ...actions }
    if (isError) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : DEFAULT_ERROR,
            ...actions,
        }
    }

    return { status: 'done', items, summary: data.summary, ...actions }
}
