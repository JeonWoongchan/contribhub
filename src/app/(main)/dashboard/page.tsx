import Link from 'next/link'
import { DashboardHelpDialog } from '@/components/dashboard/dashboard-help/DashboardHelpDialog'
import { IssueList } from '@/components/dashboard/issue/IssueList'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight text-interactive-action-hover">
              추천 이슈
            </h1>
            <p className="text-sm text-muted-foreground">
              관심사와 수준을 바탕으로 이슈를 골라봤어요.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start sm:self-stretch sm:items-end sm:justify-between">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-fit border-interactive-selected-border text-interactive-action-hover hover:bg-interactive-hover"
          >
            <Link href="/onboarding">추천 설정 다시하기</Link>
          </Button>
        </div>
      </div>
      <Separator className="bg-interactive-selected-border/50" />
      <div className="flex justify-end">
        <DashboardHelpDialog />
      </div>
      <IssueList />
    </div>
  )
}
