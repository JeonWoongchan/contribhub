// PR 요약 통계 — 전체 수, 병합 수(머지율), 진행 중, 코드 변경량 표시

import { Card, CardContent } from '@/components/ui/card'
import type { PullRequestSummary } from '@/types/pull-request'

type PRSummaryStatsProps = {
  summary: PullRequestSummary
}

export function PRSummaryStats({ summary }: PRSummaryStatsProps) {
  // 병합률 계산 — PR이 없으면 0%
  const mergeRate =
    summary.totalCount > 0 ? Math.round((summary.mergedCount / summary.totalCount) * 100) : 0

  // 표시할 통계 항목 정의
  const stats = [
    { label: '전체 PR', value: String(summary.totalCount) },
    { label: '병합됨', value: String(summary.mergedCount), detail: `${mergeRate}%` },
    { label: '진행 중', value: String(summary.openCount) },
    {
      label: '코드 변경',
      value: `+${summary.totalAdditions.toLocaleString()}`,
      detail: `-${summary.totalDeletions.toLocaleString()}`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm" className="border border-border py-3">
          <CardContent className="flex flex-col items-center gap-1 text-center">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <span className="text-lg font-semibold text-card-foreground">{stat.value}</span>
            {stat.detail && <span className="text-xs text-muted-foreground">{stat.detail}</span>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
