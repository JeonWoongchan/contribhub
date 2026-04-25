import { HelpHotspot } from '@/components/help/HelpHotspot'
import { IssueMetricsRow } from '@/components/shared/issue-card/IssueMetricsRow'
import type { BookmarkHelpGuideId } from '@/constants/bookmark-help'
import { BOOKMARK_HELP_DEMO_ISSUE } from '@/constants/bookmark-help'
import { formatTimeAgo } from '@/lib/format/time-ago'
import type { HelpGuideInteractionProps } from '@/types/help'

type BookmarkDemoCardFooterProps = HelpGuideInteractionProps<BookmarkHelpGuideId> & {
  demoUpdatedAt: string
}

function MissingMetaBadge({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-dashed border-border/80 px-2 py-1 text-[11px] text-muted-foreground/80">
      {label}
    </span>
  )
}

export function BookmarkDemoCardFooter({
  activeGuideId,
  demoUpdatedAt,
  onActivateGuide,
  onClearGuide,
}: BookmarkDemoCardFooterProps) {
  return (
    <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
      <HelpHotspot
        guideId="missing-github"
        activeGuideId={activeGuideId}
        onActivateGuide={onActivateGuide}
        onClearGuide={onClearGuide}
        className="rounded-lg"
      >
        <div className="flex flex-wrap gap-1.5">
          <MissingMetaBadge label="언어 정보 없음" />
          <MissingMetaBadge label="라벨 정보 없음" />
          <MissingMetaBadge label="저장소 상태 없음" />
        </div>
      </HelpHotspot>

      <HelpHotspot
        guideId="missing-github"
        activeGuideId={activeGuideId}
        onActivateGuide={onActivateGuide}
        onClearGuide={onClearGuide}
        className="rounded-lg"
      >
        <IssueMetricsRow
          commentCount={BOOKMARK_HELP_DEMO_ISSUE.commentCount}
          stargazerCount={BOOKMARK_HELP_DEMO_ISSUE.stargazerCount}
        />
      </HelpHotspot>

      <span className="text-interactive-action-hover">{formatTimeAgo(demoUpdatedAt)}</span>
    </div>
  )
}
