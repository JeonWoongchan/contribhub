'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/fetch-api'
import type { ScoredIssue } from '@/types/issue'
import { QUERY_KEYS } from './queryKeys'

type IssueListData = {
    issues: ScoredIssue[]
    partialResults?: boolean
    failedQueryCount?: number
}

export type UseIssueListResult = {
    issues: ScoredIssue[]
    partial: boolean
    failedCount: number
    isPending: boolean
    isError: boolean
    errorMessage: string
    refetch: () => void
}

const DEFAULT_ERROR_MESSAGE = '오류가 발생했습니다.'

const fetchIssues = () => fetchApi<IssueListData>('/api/github/issues', DEFAULT_ERROR_MESSAGE)

export function useIssueList(): UseIssueListResult {
    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.issues,
        queryFn: fetchIssues,
    })

    return {
        issues: data?.issues ?? [],
        partial: data?.partialResults ?? false,
        failedCount: data?.failedQueryCount ?? 0,
        isPending,
        isError,
        errorMessage: isError && error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
        refetch: () => { void refetch() },
    }
}
