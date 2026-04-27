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
  const { items, summary, isPending, isError, errorMessage, stateFilter, setStateFilter, refetch } = usePullRequestList()
  const { visibleItems, sentinelRef, hasMore } = useInfiniteScroll(items)

  return (
    <div className="flex flex-col gap-6">
      {summary && <PRSummaryStats summary={summary} />}

      <PRStateFilter current={stateFilter} onChange={setStateFilter} />

      <DataListState
        isPending={isPending}
        isError={isError}
        items={items}
        errorMessage={errorMessage}
        onRetry={refetch}
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
