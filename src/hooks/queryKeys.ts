import type { UseQueryResult } from '@tanstack/react-query'

export const QUERY_KEYS = {
    issues: ['issues'] as const,
    pullRequests: ['pull-requests'] as const,
    bookmarks: ['bookmarks'] as const,
} as const

export type BaseQueryResult = {
    isPending: boolean
    isError: boolean
    errorMessage: string
    refetch: () => void
}

export function toBaseResult<T>(
    query: Pick<UseQueryResult<T>, 'isPending' | 'isError' | 'error' | 'refetch'>,
    defaultError: string
): BaseQueryResult {
    return {
        isPending: query.isPending,
        isError: query.isError,
        errorMessage: query.isError && query.error instanceof Error
            ? query.error.message
            : defaultError,
        refetch: () => { void query.refetch() },
    }
}
