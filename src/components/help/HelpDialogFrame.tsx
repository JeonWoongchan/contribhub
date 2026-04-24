'use client'

import type { ReactNode } from 'react'
import { useHelpDialog } from '@/hooks/useHelpDialog'
import type { HelpGuideItem } from '@/types/help'
import { HelpGuideList } from './HelpGuideList'
import { HelpHeader } from './HelpHeader'
import { HelpTrigger } from './HelpTrigger'

type HelpDialogFrameProps<TGuideId extends string> = {
  demoUpdatedOffsetMs: number
  guideItems: readonly HelpGuideItem<TGuideId>[]
  eyebrow: string
  title: string
  titleId: string
  descriptionId: string
  triggerLabel?: string
  renderDemoCardAction: (props: {
    activeGuideId: TGuideId | null
    demoUpdatedAt: string
    onActivateGuide: (guideId: TGuideId) => void
    onClearGuide: () => void
  }) => ReactNode
}

export function HelpDialogFrame<TGuideId extends string>({
  demoUpdatedOffsetMs,
  guideItems,
  eyebrow,
  title,
  titleId,
  descriptionId,
  triggerLabel,
  renderDemoCardAction,
}: HelpDialogFrameProps<TGuideId>) {
  const {
    isOpen,
    activeGuideId,
    demoUpdatedAt,
    openDialog,
    closeDialog,
    activateGuide,
    clearActiveGuide,
  } = useHelpDialog<TGuideId>(demoUpdatedOffsetMs)

  return (
    <>
      <HelpTrigger onOpen={openDialog} label={triggerLabel} />

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          onClick={closeDialog}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <HelpHeader
              onClose={closeDialog}
              eyebrow={eyebrow}
              title={title}
              titleId={titleId}
              descriptionId={descriptionId}
            />

            <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              {renderDemoCardAction({
                activeGuideId,
                demoUpdatedAt,
                onActivateGuide: activateGuide,
                onClearGuide: clearActiveGuide,
              })}
              <HelpGuideList
                items={guideItems}
                activeGuideId={activeGuideId}
                onActivateGuide={activateGuide}
                onClearGuide={clearActiveGuide}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
