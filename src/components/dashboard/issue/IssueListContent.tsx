import { IssueCard } from '@/components/dashboard/issue/IssueCard'
import { IssueListPartialNotice } from '@/components/dashboard/issue/IssueListPartialNotice'
import { Card, CardContent } from '@/components/ui/card'
import type { ScoredIssue } from '@/types/issue'

type IssueListContentProps = {
  issues: ScoredIssue[]
  partial: boolean
  failedCount: number
}

export function IssueListContent({
  issues,
  partial,
  failedCount,
}: IssueListContentProps) {
  return (
    <div className="flex flex-col gap-4">
      {partial ? <IssueListPartialNotice failedCount={failedCount} /> : null}

      {issues.length === 0 ? (
        <Card className="border border-border py-12 text-center">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              추천할 이슈가 없어요. 프로필 설정을 확인하거나 잠시 후 다시 시도해 주세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {issues.map((issue) => (
            <IssueCard key={issue.url} issue={issue} />
          ))}
        </div>
      )}
    </div>
  )
}
