// 개별 PR 카드 — 헤더/푸터 조합으로 PR 메타데이터를 표시

import { CardShell } from '@/components/shared/card/CardShell'
import type { PullRequestItem } from '@/types/pull-request'
import { PRCardFooter } from './PRCardFooter'
import { PRCardHeader } from './PRCardHeader'

type PRCardProps = {
  pr: PullRequestItem
}

export function PRCard({ pr }: PRCardProps) {
  return (
    <CardShell>
      <PRCardHeader pr={pr} />
      <PRCardFooter pr={pr} />
    </CardShell>
  )
}
