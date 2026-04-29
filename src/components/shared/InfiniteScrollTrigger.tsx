'use client'

import { CardListSkeleton } from './CardListSkeleton'

type InfiniteScrollTriggerProps = {
    hasNextPage: boolean
    isFetchingNextPage: boolean
    sentinelRef: (el: HTMLDivElement | null) => void
}

export function InfiniteScrollTrigger({ hasNextPage, isFetchingNextPage, sentinelRef }: InfiniteScrollTriggerProps) {
    if (!hasNextPage) return null
    return (
        <>
            {isFetchingNextPage && <CardListSkeleton count={2} />}
            <div ref={sentinelRef} className="h-10" />
        </>
    )
}
