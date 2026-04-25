// PR 상태 필터 버튼 — 전체/진행 중/병합됨/닫힘 선택

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PullRequestState } from '@/types/pull-request'

type PRStateFilterProps = {
  current: PullRequestState | null
  onChange: (state: PullRequestState | null) => void
}

// 필터 옵션 목록 — null은 전체 조회
const FILTERS: { label: string; value: PullRequestState | null }[] = [
  { label: '전체', value: null },
  { label: '진행 중', value: 'OPEN' },
  { label: '병합됨', value: 'MERGED' },
  { label: '닫힘', value: 'CLOSED' },
]

export function PRStateFilter({ current, onChange }: PRStateFilterProps) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((filter) => (
        <Button
          key={filter.label}
          variant="outline"
          size="sm"
          className={cn(
            'text-xs',
            current === filter.value
              ? 'border-interactive-selected-border bg-interactive-selected text-interactive-action-hover'
              : 'text-muted-foreground hover:bg-interactive-hover',
          )}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}
