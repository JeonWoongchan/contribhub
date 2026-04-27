'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_PAGE_SIZE = 20

export function useInfiniteScroll<T>(allItems: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [displayCount, setDisplayCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 데이터 교체(refetch, 필터 변경) 시 표시 개수 초기화
  useEffect(() => {
    setDisplayCount(pageSize)
  }, [allItems.length, pageSize])

  // sentinel 요소가 뷰포트에 진입하면 다음 페이지 노출
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + pageSize, allItems.length))
        }
      },
      { rootMargin: '100px' }, // 바닥 100px 전에 미리 트리거
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [allItems.length, pageSize])

  return {
    visibleItems: allItems.slice(0, displayCount),
    sentinelRef,
    hasMore: displayCount < allItems.length,
  }
}
