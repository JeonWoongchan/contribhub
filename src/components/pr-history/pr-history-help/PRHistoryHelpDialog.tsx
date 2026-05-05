'use client'

import { HelpDialogFrame } from '@/components/help/HelpDialogFrame'
import { HelpReportFooter } from '@/components/help/HelpReportFooter'
import {
    PR_HISTORY_HELP_DEMO_OFFSET_MS,
    PR_HISTORY_HELP_GUIDE_ITEMS,
    type PRHistoryHelpGuideId,
} from '@/constants/pr-history-help'
import { PRHistoryDemoCard } from './PRHistoryDemoCard'

export function PRHistoryHelpDialog() {
    return (
        <HelpDialogFrame<PRHistoryHelpGuideId>
            demoUpdatedOffsetMs={PR_HISTORY_HELP_DEMO_OFFSET_MS}
            guideItems={PR_HISTORY_HELP_GUIDE_ITEMS}
            eyebrow="카드 읽는 법"
            title="Q. PR 카드의 요소는 무엇을 의미하나요?"
            titleId="pr-history-help-title"
            descriptionId="pr-history-help-description"
            footer={<HelpReportFooter />}
            renderDemoCardAction={(props) => <PRHistoryDemoCard {...props} />}
        />
    )
}
