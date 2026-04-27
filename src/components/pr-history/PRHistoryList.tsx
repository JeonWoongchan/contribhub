// PR 히스토리 오케스트레이터 — 훅 연결, 요약 통계 + 필터 + 목록 조합
'use client'

import Link from 'next/link'
import { DataListState } from '@/components/shared/DataListState'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { usePullRequestList } from '@/hooks/usePullRequestList'
import { PRHistoryContent } from './PRHistoryContent'
import { PRStateFilter } from './PRStateFilter'
import { PRSummaryStats } from './PRSummaryStats'

export function PRHistoryList() {
  const prListState = usePullRequestList()
  const allItems = prListState.status === 'done' ? prListState.items : []
  const { visibleItems, sentinelRef, hasMore } = useInfiniteScroll(allItems)

  return (
    <div className="flex flex-col gap-6">
      {prListState.status === 'done' && (
        <PRSummaryStats summary={prListState.summary} />
      )}

      {/* 상태별 필터 버튼 */}
      <PRStateFilter current={prListState.stateFilter} onChange={prListState.setStateFilter} />

      {/* 로딩/에러/빈 상태/콘텐츠 분기 처리 */}
      <DataListState
        status={prListState.status}
        items={allItems}
        errorMessage={prListState.status === 'error' ? prListState.message : undefined}
        onRetry={prListState.refetch}
        skeletonCount={6}
        emptyTitle="PR 기록이 없습니다"
        emptyDescription="아직 GitHub에 제출한 Pull Request가 없습니다."
        emptyDetail="오픈소스 프로젝트에 기여해 보세요."
        emptyAction={<Link href="/dashboard">추천 이슈 보러가기</Link>}
        renderContent={() => <PRHistoryContent items={visibleItems} />}
      />
      {hasMore && <div ref={sentinelRef} className="h-10" />}
    </div>
  )
}
