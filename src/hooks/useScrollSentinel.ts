'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// sentinel 요소가 뷰포트에 들어오면 onEnter를 호출한다.
// callback ref를 사용해 조건부 렌더링에도 observer 등록 대상을 정확히 유지한다.
export function useScrollSentinel(onEnter: () => void): (element: HTMLDivElement | null) => void {
  const callbackRef = useRef(onEnter)
  callbackRef.current = onEnter

  const [sentinelElement, setSentinelElement] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!sentinelElement) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callbackRef.current()
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(sentinelElement)

    return () => observer.disconnect()
  }, [sentinelElement])

  return setSentinelElement
}

// 무한 스크롤 목록에서 sentinel이 보일 때 다음 페이지를 요청한다.
// isSearchActive가 true이면 클라이언트 검색 중으로 간주해 추가 로드와 홀수 처리를 비활성화한다.
export function useInfiniteScrollDisplay<T>({
  items,
  hasNextPage,
  fetchNextPageAction,
  isFetchingNextPage,
  isSearchActive = false,
}: {
  items: T[]
  hasNextPage: boolean
  fetchNextPageAction: () => void
  isFetchingNextPage: boolean
  isSearchActive?: boolean
}): { displayItems: T[]; effectiveHasNextPage: boolean; sentinelRefAction: (element: HTMLDivElement | null) => void } {
  const effectiveHasNextPage = isSearchActive ? false : hasNextPage
  const displayItems = effectiveHasNextPage && items.length % 2 !== 0 ? items.slice(0, -1) : items

  const sentinelRefAction = useScrollSentinel(
    useCallback(() => {
      if (effectiveHasNextPage && !isFetchingNextPage) {
        fetchNextPageAction()
      }
    }, [fetchNextPageAction, effectiveHasNextPage, isFetchingNextPage])
  )

  return { displayItems, effectiveHasNextPage, sentinelRefAction }
}
