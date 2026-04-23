import { IssueCardFooter } from '@/components/dashboard/issue/IssueCardFooter'
import { IssueCardHeader } from '@/components/dashboard/issue/IssueCardHeader'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { IssueCardProps } from '@/types/issue'

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block outline-none transition-transform duration-150 hover:-translate-y-0.5',
        'focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-interactive-selected-ring/60'
      )}
    >
      <Card
        size="sm"
        className={cn(
          'h-full border border-border py-4 transition-all',
          'group-hover:border-interactive-selected-border group-hover:shadow-[0_0_0_1px_var(--color-interactive-selected-border)]'
        )}
      >
        <CardContent className="flex h-full flex-col gap-4">
          <IssueCardHeader issue={issue} />
          <IssueCardFooter issue={issue} />
        </CardContent>
      </Card>
    </a>
  )
}
