import { Card, CardContent } from '@/components/ui/card'

type IssueListPartialNoticeProps = {
  failedCount: number
}

export function IssueListPartialNotice({ failedCount }: IssueListPartialNoticeProps) {
  return (
    <Card size="sm" className="border border-status-warning-border bg-status-warning py-4">
      <CardContent>
        <p className="text-xs text-status-warning-foreground">
          일부 쿼리({failedCount}개)에서 오류가 발생해 결과가 일부만 표시되고 있어요.
        </p>
      </CardContent>
    </Card>
  )
}
