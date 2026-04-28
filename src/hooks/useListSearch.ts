'use client'

import { useState, RefObject } from 'react'
import { useInfiniteScroll } from './useInfiniteScroll'
import { useSearchFilter, type SearchableItem } from './useSearchFilter'

type UseListSearchResult<T> = {
    query: string
    setQuery: (value: string) => void
    filteredItems: T[]
    visibleItems: T[]
    sentinelRef: RefObject<HTMLDivElement | null>
    hasMore: boolean
    resultCount: number | undefined
}

const DEFAULT_PAGE_SIZE = 20

export function useListSearch<T extends SearchableItem>(
    items: T[],
    pageSize = DEFAULT_PAGE_SIZE,
): UseListSearchResult<T> {
    const [query, setQuery] = useState('')
    const filteredItems = useSearchFilter(items, query)
    const { visibleItems, sentinelRef, hasMore } = useInfiniteScroll(filteredItems, pageSize, query)

    return {
        query,
        setQuery,
        filteredItems,
        visibleItems,
        sentinelRef,
        hasMore,
        resultCount: query ? filteredItems.length : undefined,
    }
}
