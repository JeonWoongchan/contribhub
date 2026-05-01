import { FileCode, MessageSquare, Star } from 'lucide-react'
import { HelpHotspot } from '@/components/help/HelpHotspot'
import { Badge } from '@/components/ui/badge'
import { CardMetricsRow } from '@/components/shared/card/CardMetricsRow'
import { CardTagsRow } from '@/components/shared/card/CardTagsRow'
import { PR_HISTORY_HELP_DEMO_PR } from '@/constants/pr-history-help'
import type { PRHistoryHelpGuideId } from '@/constants/pr-history-help'
import type { HelpGuideInteractionProps } from '@/types/help'
import { formatTimeAgo } from '@/utils/format/time-ago'

type PRHistoryDemoCardFooterProps = HelpGuideInteractionProps<PRHistoryHelpGuideId> & {
    demoUpdatedAt: string
}

export function PRHistoryDemoCardFooter({
    activeGuideId,
    demoUpdatedAt,
    onActivateGuide,
    onClearGuide,
}: PRHistoryDemoCardFooterProps) {
    return (
        <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
            <HelpHotspot
                guideId="tags"
                activeGuideId={activeGuideId}
                onActivateGuide={onActivateGuide}
                onClearGuide={onClearGuide}
                className="rounded-xl"
            >
                <CardTagsRow>
                    {PR_HISTORY_HELP_DEMO_PR.language && (
                        <Badge variant="secondary" className="rounded-md text-xs">
                            {PR_HISTORY_HELP_DEMO_PR.language}
                        </Badge>
                    )}
                    {PR_HISTORY_HELP_DEMO_PR.labels.slice(0, 3).map((label) => (
                        <Badge key={label} variant="outline" className="rounded-md text-xs">
                            {label}
                        </Badge>
                    ))}
                </CardTagsRow>
            </HelpHotspot>

            <CardMetricsRow>
                <HelpHotspot
                    guideId="code-diff"
                    activeGuideId={activeGuideId}
                    onActivateGuide={onActivateGuide}
                    onClearGuide={onClearGuide}
                    className="rounded-md"
                >
                    <span className="flex items-center gap-1">
                        <FileCode className="size-3.5" />
                        <span className="text-status-success-foreground">+{PR_HISTORY_HELP_DEMO_PR.additions}</span>
                        <span className="text-status-danger-foreground">-{PR_HISTORY_HELP_DEMO_PR.deletions}</span>
                    </span>
                </HelpHotspot>
                <span className="flex items-center gap-1">
                    <MessageSquare className="size-3.5" />
                    {PR_HISTORY_HELP_DEMO_PR.commentCount}
                </span>
                <span className="flex items-center gap-1">
                    <Star className="size-3.5" />
                    {PR_HISTORY_HELP_DEMO_PR.stargazerCount.toLocaleString()}
                </span>
                <span className="ml-auto text-interactive-action-hover">{formatTimeAgo(demoUpdatedAt)}</span>
            </CardMetricsRow>
        </div>
    )
}
