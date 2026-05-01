import { GitPullRequest } from 'lucide-react'
import { HelpHotspot } from '@/components/help/HelpHotspot'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PR_STATE_META } from '@/lib/github/issues/badge-meta'
import { PR_HISTORY_HELP_DEMO_PR } from '@/constants/pr-history-help'
import type { PRHistoryHelpGuideId } from '@/constants/pr-history-help'
import type { HelpGuideInteractionProps } from '@/types/help'

type PRHistoryDemoCardHeaderProps = HelpGuideInteractionProps<PRHistoryHelpGuideId>

export function PRHistoryDemoCardHeader({
    activeGuideId,
    onActivateGuide,
    onClearGuide,
}: PRHistoryDemoCardHeaderProps) {
    const stateMeta = PR_STATE_META[PR_HISTORY_HELP_DEMO_PR.state]

    return (
        <>
            <div className="flex items-start justify-between gap-3">
                <span className="truncate text-xs text-muted-foreground">
                    {PR_HISTORY_HELP_DEMO_PR.repoFullName}
                </span>
                <HelpHotspot
                    guideId="state"
                    activeGuideId={activeGuideId}
                    onActivateGuide={onActivateGuide}
                    onClearGuide={onClearGuide}
                    className="rounded-md"
                >
                    <Badge variant="outline" className={cn('rounded-md', stateMeta.className)}>
                        {stateMeta.label}
                    </Badge>
                </HelpHotspot>
            </div>

            <h3 className="line-clamp-2 flex items-center gap-1.5 text-sm font-medium leading-snug text-card-foreground">
                <GitPullRequest className="size-4 shrink-0" />
                {PR_HISTORY_HELP_DEMO_PR.title}
            </h3>
        </>
    )
}
