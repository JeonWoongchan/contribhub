import { Card, CardContent } from '@/components/ui/card'
import { DemoCardFooter } from './DemoCardFooter'
import { DemoCardHeader } from './DemoCardHeader'
import type { DashboardHelpGuideInteractionProps } from '@/types/dashboard'

type DashboardHelpDemoCardProps = DashboardHelpGuideInteractionProps & {
  demoUpdatedAt: string
}

export function DashboardHelpDemoCard({
  activeGuideId,
  demoUpdatedAt,
  onActivateGuide,
  onClearGuide,
}: DashboardHelpDemoCardProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">예시 카드</p>
      <Card
        size="sm"
        className="border border-border py-4 shadow-[0_0_0_1px_var(--color-interactive-selected-border)]"
      >
        <CardContent className="flex h-full flex-col gap-4">
          <DemoCardHeader
            activeGuideId={activeGuideId}
            onActivateGuide={onActivateGuide}
            onClearGuide={onClearGuide}
          />
          <DemoCardFooter
            activeGuideId={activeGuideId}
            demoUpdatedAt={demoUpdatedAt}
            onActivateGuide={onActivateGuide}
            onClearGuide={onClearGuide}
          />
        </CardContent>
      </Card>

      <div className="rounded-xl border border-dashed border-interactive-selected-border/70 bg-interactive-selected/30 p-4 text-sm text-muted-foreground">
        카드 요소에 마우스를 올리면 오른쪽 설명도 같이 강조됩니다.
      </div>
    </div>
  )
}
