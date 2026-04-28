'use client'

import { useMemo } from 'react'

export type SearchableItem = {
    title: string
    repoFullName: string
}

export function useSearchFilter<T extends SearchableItem>(items: T[], query: string): T[] {
    return useMemo(() => {
        const normalized = query.toLowerCase().trim()
        if (!normalized) return items
        return items.filter(
            (item) =>
                item.title.toLowerCase().includes(normalized) ||
                item.repoFullName.toLowerCase().includes(normalized),
        )
    }, [items, query])
}
