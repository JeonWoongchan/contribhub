import { IssueList } from '@/components/dashboard/IssueList'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Badge
          variant="outline"
          className="w-fit rounded-md border-transparent bg-interactive-action text-interactive-action-foreground"
        >
          Dashboard
        </Badge>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-interactive-action-hover">추천 이슈</h1>
          <p className="text-sm text-muted-foreground">
            내 경험 수준과 선호도에 맞는 오픈소스 이슈를 골라줍니다.
          </p>
        </div>
      </div>
      <Separator className="bg-interactive-selected-border/50" />
      <IssueList />
    </div>
  )
}
