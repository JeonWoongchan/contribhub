'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// 서버 사이드 페이지네이션용 sentinel — 뷰포트 진입 시 onEnter 호출
// 콜백 ref(state) 방식으로 sentinel 요소가 조건부 렌더링될 때도 observer가 정확히 등록/해제된다
export function useScrollSentinel(onEnter: () => void): (el: HTMLDivElement | null) => void {
    const callbackRef = useRef(onEnter)
    callbackRef.current = onEnter

    const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!sentinelEl) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) callbackRef.current()
            },
            { rootMargin: '100px' },
        )

        observer.observe(sentinelEl)
        return () => observer.disconnect()
    }, [sentinelEl])

    return setSentinelEl
}

// 무한스크롤 목록 표시를 위한 공통 로직:
//   displayItems — 다음 페이지가 있을 때 홀수 개면 마지막 1개를 숨겨 2열 그리드를 짝수로 유지
//   sentinelRef  — 뷰포트 진입 시 다음 페이지 요청, 중복 요청 방지
export function useInfiniteScrollDisplay<T>({
    items,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
}: {
    items: T[]
    hasNextPage: boolean
    fetchNextPage: () => void
    isFetchingNextPage: boolean
}): { displayItems: T[]; sentinelRef: (el: HTMLDivElement | null) => void } {
    const displayItems = hasNextPage && items.length % 2 !== 0
        ? items.slice(0, -1)
        : items

    const sentinelRef = useScrollSentinel(
        useCallback(() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
    )

    return { displayItems, sentinelRef }
}
