'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useHelpDialog } from '@/hooks/useHelpDialog'
import type { HelpGuideItem } from '@/types/help'
import { cn } from '@/lib/utils'
import { HelpGuideList } from './HelpGuideList'
import { HelpHeader } from './HelpHeader'
import { HelpTrigger } from './HelpTrigger'

type ExtraTab = {
    id: string
    label: string
    content: ReactNode
}

// 대시보드·북마크·PR 히스토리 도움말이 공통으로 사용하는 다이얼로그 프레임.
// 트리거 버튼, 오버레이, 헤더, 좌우 2단 그리드(데모 카드 + 가이드 목록)를 통합 관리.
// primaryTabLabel + extraTabs를 모두 전달하면 탭 UI가 활성화된다.
type HelpDialogFrameProps<TGuideId extends string> = {
  demoUpdatedOffsetMs: number
  guideItems: readonly HelpGuideItem<TGuideId>[]
  eyebrow: string
  title: string
  titleId: string
  descriptionId: string
  triggerLabel?: string
  footer?: ReactNode
  // render prop — useHelpDialog 내부 상태(activeGuideId, demoUpdatedAt 등)를
  // 데모 카드에 직접 전달하기 위해 ReactNode 대신 함수로 받음
  renderDemoCardAction: (props: {
    activeGuideId: TGuideId | null
    demoUpdatedAt: string
    onActivateGuide: (guideId: TGuideId) => void
    onClearGuide: () => void
  }) => ReactNode
  primaryTabLabel?: string
  extraTabs?: readonly ExtraTab[]
}

export function HelpDialogFrame<TGuideId extends string>({
  demoUpdatedOffsetMs,
  guideItems,
  eyebrow,
  title,
  titleId,
  descriptionId,
  triggerLabel,
  footer,
  renderDemoCardAction,
  primaryTabLabel,
  extraTabs,
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

  const [activeTabIndex, setActiveTabIndex] = useState(0)

  // 다이얼로그가 닫히면 첫 번째 탭으로 초기화
  useEffect(() => {
    if (!isOpen) setActiveTabIndex(0)
  }, [isOpen])

  const hasTabs =
    primaryTabLabel !== undefined && extraTabs !== undefined && extraTabs.length > 0

  // hasTabs가 참일 때만 extraTabs 접근 — 타입 내로잉 보조
  const activeExtraTabContent =
    hasTabs && activeTabIndex > 0 ? extraTabs[activeTabIndex - 1].content : null

  return (
    <>
      <HelpTrigger onOpen={openDialog} label={triggerLabel} />

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-sm sm:py-6"
          onClick={closeDialog}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="flex max-h-[calc(100svh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:max-h-[calc(100svh-3rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <HelpHeader
              onClose={closeDialog}
              eyebrow={eyebrow}
              title={title}
              titleId={titleId}
              descriptionId={descriptionId}
            />

            {hasTabs ? (
              <div className="flex gap-4 border-b border-border px-5 sm:px-6" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTabIndex === 0}
                  onClick={() => setActiveTabIndex(0)}
                  className={cn(
                    '-mb-px border-b-2 py-3 text-sm font-medium transition-colors',
                    activeTabIndex === 0
                      ? 'border-interactive-action text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {primaryTabLabel}
                </button>
                {extraTabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTabIndex === i + 1}
                    onClick={() => setActiveTabIndex(i + 1)}
                    className={cn(
                      '-mb-px border-b-2 py-3 text-sm font-medium transition-colors',
                      activeTabIndex === i + 1
                        ? 'border-interactive-action text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : null}

            {activeExtraTabContent !== null ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                {activeExtraTabContent}
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-5 py-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div className="shrink-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
                  {renderDemoCardAction({
                    activeGuideId,
                    demoUpdatedAt,
                    onActivateGuide: activateGuide,
                    onClearGuide: clearActiveGuide,
                  })}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <HelpGuideList
                    items={guideItems}
                    activeGuideId={activeGuideId}
                    onActivateGuide={activateGuide}
                    onClearGuide={clearActiveGuide}
                  />
                </div>
              </div>
            )}

            {footer ? (
              <div className="border-t border-border/70 bg-muted/20 px-5 py-4 text-sm leading-6 text-muted-foreground sm:px-6">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
