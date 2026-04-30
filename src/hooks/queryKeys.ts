export const QUERY_KEYS = {
    issues: ['issues'] as const,
    pullRequests: ['pull-requests'] as const,
    bookmarks: ['bookmarks'] as const,
    myPage: ['my-page'] as const,
    myPageActivity: ['my-page-activity'] as const,
} as const

export type BaseQueryResult = {
    isPending: boolean
    isError: boolean
    errorMessage: string
    refetch: () => void
}

type QueryBaseFields = {
    isPending: boolean
    isError: boolean
    error: unknown
    refetch: () => unknown
}

export function toBaseResult(query: QueryBaseFields, defaultError: string): BaseQueryResult {
    return {
        isPending: query.isPending,
        isError: query.isError,
        errorMessage: query.isError && query.error instanceof Error
            ? query.error.message
            : defaultError,
        refetch: () => { void query.refetch() },
    }
}
