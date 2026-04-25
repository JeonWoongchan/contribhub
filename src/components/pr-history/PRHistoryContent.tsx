// PR 카드 그리드 렌더링

import type { PullRequestItem } from '@/types/pull-request'
import { PRCard } from './PRCard'

type PRHistoryContentProps = {
  items: PullRequestItem[]
}

export function PRHistoryContent({ items }: PRHistoryContentProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((pr) => (
        <PRCard key={pr.url} pr={pr} />
      ))}
    </div>
  )
}
