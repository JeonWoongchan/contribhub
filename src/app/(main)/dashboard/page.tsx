import Link from 'next/link'
import { IssueList } from '@/components/dashboard/IssueList'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Badge
            variant="outline"
            className="w-fit rounded-md border-transparent bg-interactive-action text-interactive-action-foreground"
          >
            Dashboard
          </Badge>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight text-interactive-action-hover">
              추천 이슈
            </h1>
            <p className="text-sm text-muted-foreground">
              경험 수준과 선호 설정에 맞는 오픈소스 이슈를 골라줍니다.
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-fit border-interactive-selected-border text-interactive-action-hover hover:bg-interactive-hover"
        >
          <Link href="/onboarding">개인 설정 다시하기</Link>
        </Button>
      </div>
      <Separator className="bg-interactive-selected-border/50" />
      <IssueList />
    </div>
  )
}
