'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { CircleHelp, ExternalLink, MessageCircle, Star, X, Zap } from 'lucide-react'
import { RepoHealthBadge } from '@/components/dashboard/RepoHealthBadge'
import { IssueCardTags } from '@/components/dashboard/IssueCardTags'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatTimeAgo } from '@/lib/format/time-ago'
import { getCompetitionMeta } from '@/lib/github/issue-badge-meta'
import { cn } from '@/lib/utils'

// Demo card keeps the relative time fixed to one day ago.
const DEMO_UPDATED_AT = new Date(Date.now() - 86_400_000).toISOString()

const GUIDE_ITEMS = [
  {
    id: 'score',
    title: '추천도',
    description: '오른쪽 위 점수예요. 지금 설정한 선호와 이슈가 얼마나 잘 맞는지 보여줘요.',
  },
  {
    id: 'stack',
    title: '기술 스택과 난이도',
    description: '언어, 난이도, 라벨을 보면 이슈 성격을 빠르게 파악할 수 있어요.',
  },
  {
    id: 'metrics',
    title: '별 수와 댓글',
    description: '프로젝트 규모와 이슈 대화량을 함께 보여줘요. 난이도를 짐작할 때 도움돼요.',
  },
  {
    id: 'health',
    title: '레포 활성도',
    description: '아래 상태 배지예요. 저장소가 꾸준히 관리되는 곳인지 참고할 수 있어요.',
  },
  {
    id: 'competition',
    title: '경쟁도',
    description: '이미 누가 보고 있는지, PR이 있는지 보여줘서 진입 부담을 가늠하게 해줘요.',
  },
] as const

type GuideItemId = (typeof GUIDE_ITEMS)[number]['id']

const competition = getCompetitionMeta('ACTIVE')

export function DashboardHelpDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeGuideId, setActiveGuideId] = useState<GuideItemId | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-fit text-muted-foreground hover:bg-interactive-hover hover:text-interactive-action-hover"
      >
        <CircleHelp className="h-4 w-4" />
        카드 읽는 법
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-help-title"
            aria-describedby="dashboard-help-description"
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div className="space-y-1">
                <p
                  id="dashboard-help-description"
                  className="text-sm font-medium text-interactive-action-hover"
                >
                  카드 읽는 법
                </p>
                <h2 id="dashboard-help-title" className="text-lg font-semibold tracking-tight">
                  이슈 카드는 이렇게 읽어보세요
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
                aria-label="도움말 닫기"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <DemoIssueCard
                activeGuideId={activeGuideId}
                onActiveGuideChange={setActiveGuideId}
              />
              <div className="space-y-3">
                {GUIDE_ITEMS.map((item, index) => {
                  const isActive = item.id === activeGuideId

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveGuideId(item.id)}
                      onMouseLeave={() => setActiveGuideId(null)}
                      onFocus={() => setActiveGuideId(item.id)}
                      onBlur={() => setActiveGuideId(null)}
                      className={cn(
                        'block w-full rounded-xl border bg-card/60 p-4 text-left outline-none transition-all',
                        'focus-visible:ring-2 focus-visible:ring-interactive-selected-ring/60',
                        isActive
                          ? 'scale-[1.01] border-border bg-interactive-selected/45 shadow-lg'
                          : 'border-border hover:border-interactive-selected-border/70 hover:bg-card'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                            isActive
                              ? 'bg-interactive-action text-interactive-action-foreground'
                              : 'bg-interactive-selected text-interactive-selected-foreground'
                          )}
                        >
                          {index + 1}
                        </span>
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

type DemoIssueCardProps = {
  activeGuideId: GuideItemId | null
  onActiveGuideChange: (guideId: GuideItemId | null) => void
}

function DemoIssueCard({ activeGuideId, onActiveGuideChange }: DemoIssueCardProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">예시 카드</p>
      <Card
        size="sm"
        className="border border-border py-4 shadow-[0_0_0_1px_var(--color-interactive-selected-border)]"
      >
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <span className="truncate text-xs text-muted-foreground">vercel/next.js</span>
            <GuideHotspot
              guideId="score"
              activeGuideId={activeGuideId}
              onActiveGuideChange={onActiveGuideChange}
              className="rounded-lg"
            >
              <Badge
                variant="outline"
                className="shrink-0 rounded-md border-transparent bg-interactive-action text-interactive-action-foreground"
              >
                <Zap className="h-3 w-3" />
                <span className="tabular-nums">82</span>
              </Badge>
            </GuideHotspot>
          </div>

          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
            문서 예제에서 타입 누락을 정리하고 초심자 가이드를 보완하기
          </h3>

          <GuideHotspot
            guideId="stack"
            activeGuideId={activeGuideId}
            onActiveGuideChange={onActiveGuideChange}
            className="rounded-xl"
          >
            <IssueCardTags
              difficultyLevel="beginner"
              labels={['documentation', 'good first issue']}
              language="TypeScript"
            />
          </GuideHotspot>

          <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
            <GuideHotspot
              guideId="metrics"
              activeGuideId={activeGuideId}
              onActiveGuideChange={onActiveGuideChange}
              className="rounded-xl"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {(129000).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  3
                </span>
              </div>
            </GuideHotspot>

            <div className="flex flex-wrap items-center gap-2">
              <GuideHotspot
                guideId="health"
                activeGuideId={activeGuideId}
                onActiveGuideChange={onActiveGuideChange}
                className="rounded-xl"
              >
                <RepoHealthBadge score={78} />
              </GuideHotspot>

              <GuideHotspot
                guideId="competition"
                activeGuideId={activeGuideId}
                onActiveGuideChange={onActiveGuideChange}
                className="rounded-xl"
              >
                <Badge variant="outline" className={cn('rounded-md', competition.className)}>
                  {competition.label}
                </Badge>
              </GuideHotspot>

              <span className="text-interactive-action-hover">{formatTimeAgo(DEMO_UPDATED_AT)}</span>
              <ExternalLink className="ml-auto h-3 w-3 text-interactive-action opacity-70" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-dashed border-interactive-selected-border/70 bg-interactive-selected/30 p-4 text-sm text-muted-foreground">
        카드 요소에 마우스를 올리면 오른쪽 설명도 같이 강조돼요.
      </div>
    </div>
  )
}

type GuideHotspotProps = {
  guideId: GuideItemId
  activeGuideId: GuideItemId | null
  onActiveGuideChange: (guideId: GuideItemId | null) => void
  className?: string
  children: ReactNode
}

function GuideHotspot({
  guideId,
  activeGuideId,
  onActiveGuideChange,
  className,
  children,
}: GuideHotspotProps) {
  const isActive = guideId === activeGuideId

  return (
    <button
      type="button"
      onMouseEnter={() => onActiveGuideChange(guideId)}
      onMouseLeave={() => onActiveGuideChange(null)}
      onFocus={() => onActiveGuideChange(guideId)}
      onBlur={() => onActiveGuideChange(null)}
      className={cn(
        'inline-flex w-fit text-left outline-none transition-all',
        'focus-visible:ring-2 focus-visible:ring-interactive-selected-ring/60',
        className,
        isActive && 'scale-[1.03] bg-interactive-selected/30 shadow-lg'
      )}
    >
      {children}
    </button>
  )
}
