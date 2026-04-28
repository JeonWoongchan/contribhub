'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_PAGE_SIZE = 20

// resetKey: 검색어 등 외부 상태 변경 시 강제 리셋 (길이가 같아도 초기화 필요한 경우)
export function useInfiniteScroll<T>(allItems: T[], pageSize = DEFAULT_PAGE_SIZE, resetKey?: unknown) {
  const [displayCount, setDisplayCount] = useState(pageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 데이터 교체(refetch, 필터/검색 변경) 시 표시 개수 초기화
  useEffect(() => {
    setDisplayCount(pageSize)
  }, [allItems.length, pageSize, resetKey])

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
