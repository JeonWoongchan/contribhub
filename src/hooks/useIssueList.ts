'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/fetch-api'
import type { ScoredIssue } from '@/types/issue'
import { QUERY_KEYS, toBaseResult, type BaseQueryResult } from './queryKeys'

type IssueListData = {
    issues: ScoredIssue[]
    partialResults?: boolean
    failedQueryCount?: number
}

export type UseIssueListResult = BaseQueryResult & {
    issues: ScoredIssue[]
    partial: boolean
    failedCount: number
}

const DEFAULT_ERROR_MESSAGE = '오류가 발생했습니다.'

const fetchIssues = () => fetchApi<IssueListData>('/api/github/issues', DEFAULT_ERROR_MESSAGE)

export function useIssueList(): UseIssueListResult {
    const query = useQuery({
        queryKey: QUERY_KEYS.issues,
        queryFn: fetchIssues,
    })

    return {
        ...toBaseResult(query, DEFAULT_ERROR_MESSAGE),
        issues: query.data?.issues ?? [],
        partial: query.data?.partialResults ?? false,
        failedCount: query.data?.failedQueryCount ?? 0,
    }
}
