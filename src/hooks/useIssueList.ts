'use client'

import { useQuery } from '@tanstack/react-query'
import type { ScoredIssue } from '@/types/issue'
import { QUERY_KEYS } from './queryKeys'

type IssueListData = {
    issues: ScoredIssue[]
    partialResults?: boolean
    failedQueryCount?: number
}

type IssueListResponse =
    | { ok: true; data: IssueListData }
    | { ok: false; error?: { message?: string } }

type IssueListState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'done'; issues: ScoredIssue[]; partial: boolean; failedCount: number }

type IssueListResult = IssueListState & { refetch: () => void }

const DEFAULT_ERROR_MESSAGE = '오류가 발생했습니다.'

async function fetchIssues(): Promise<IssueListData> {
    const res = await fetch('/api/github/issues')
    const json = (await res.json()) as IssueListResponse
    if (!json.ok) throw new Error(json.error?.message ?? DEFAULT_ERROR_MESSAGE)
    return json.data
}

export function useIssueList(): IssueListResult {
    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.issues,
        queryFn: fetchIssues,
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
        partial: data.partialResults ?? false,
        failedCount: data.failedQueryCount ?? 0,
        refetch: doRefetch,
    }
}
