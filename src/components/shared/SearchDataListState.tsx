import type { ReactNode } from 'react'
import { DataListState } from './DataListState'

type EmptyStateFallback = {
    title: string
    description: string
    detail?: string
    action?: ReactNode
}

// 검색 중일 때와 기본 상태를 분기해 DataListState 빈 상태 props 반환
function buildSearchEmptyState(query: string, entityLabel: string, fallback: EmptyStateFallback) {
    if (!query) {
        return {
            emptyTitle: fallback.title,
            emptyDescription: fallback.description,
            emptyDetail: fallback.detail,
            emptyAction: fallback.action,
        }
    }
    return {
        emptyTitle: '검색 결과가 없습니다',
        emptyDescription: `"${query}"에 해당하는 ${entityLabel}을 찾지 못했습니다.`,
        emptyDetail: '다른 검색어를 시도해 보세요.',
        emptyAction: undefined as ReactNode,
    }
}

type SearchDataListStateProps<T> = {
    query: string
    entityLabel: string
    fallback: EmptyStateFallback
    isPending: boolean
    isError: boolean
    items: T[]
    errorMessage?: string
    onRetry?: () => void
    skeletonCount?: number
    renderContent: () => ReactNode
}

export function SearchDataListState<T>({
    query,
    entityLabel,
    fallback,
    ...dataListProps
}: SearchDataListStateProps<T>) {
    return (
        <DataListState
            {...dataListProps}
            {...buildSearchEmptyState(query, entityLabel, fallback)}
        />
    )
}
