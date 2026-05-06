import { CardHeaderLayout } from '@/components/shared/card/CardHeaderLayout'
import { CardShell } from '@/components/shared/card/CardShell'
import { IssueItemFooter } from '@/components/shared/issue-card/IssueItemFooter'
import { IssueScoreBadge } from '@/components/shared/issue-card/IssueScoreBadge'
import type { IssueCardItem } from '@/types/issue'
import { Bookmark } from 'lucide-react'

type IssueMockCardProps = {
    issue: IssueCardItem
}

export function IssueMockCard({ issue }: IssueMockCardProps) {
    return (
        <CardShell
            className="pointer-events-none select-none transition-all"
            contentClassName="gap-4"
        >
            <CardHeaderLayout
                topLeft={
                    <span className="block truncate text-xs text-muted-foreground transition-colors hover:text-interactive-action-hover">
                        {issue.repoFullName}
                    </span>
                }
                topRight={
                    <div className="flex items-center gap-1">
                        <Bookmark className="size-4 text-muted-foreground/30" />
                        {issue.score !== null ? <IssueScoreBadge score={issue.score} /> : null}
                    </div>
                }
                title={
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
                        {issue.title}
                    </h3>
                }
            />
            <IssueItemFooter issue={issue} />
        </CardShell>
    )
}
