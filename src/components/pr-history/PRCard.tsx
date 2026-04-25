// 개별 PR 카드 — 헤더/푸터 조합으로 PR 메타데이터를 표시

import { Card, CardContent } from '@/components/ui/card'
import type { PullRequestItem } from '@/types/pull-request'
import { PRCardFooter } from './PRCardFooter'
import { PRCardHeader } from './PRCardHeader'

type PRCardProps = {
  pr: PullRequestItem
}

export function PRCard({ pr }: PRCardProps) {
  return (
    <Card size="sm" className="h-full border border-border py-4">
      <CardContent className="flex h-full flex-col gap-3">
        <PRCardHeader pr={pr} />
        <PRCardFooter pr={pr} />
      </CardContent>
    </Card>
  )
}
