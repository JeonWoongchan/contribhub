import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type IssueCandidateLoadMoreNoticeProps = {
  isLoading: boolean
  canLoadMore: boolean
  emptyFetchCount: number
  onLoadMoreAction: () => void
}

type CandidateNoticeState = 'initial' | 'missed' | 'exhausted'

type CandidateNoticeCopy = {
  title: string
  description: string
  buttonLabel?: string
}

const CANDIDATE_NOTICE_COPY: Record<CandidateNoticeState, CandidateNoticeCopy> = {
  initial: {
    title: '다른 이슈들을 더 보고 싶으신가요?',
    description: 'GitHub에서 다음 후보를 더 조회해 조건에 맞는 이슈를 이어서 찾아볼 수 있습니다.',
    buttonLabel: '이슈 더 찾아보기',
  },
  missed: {
    title: '다음 목록에서도 조건에 맞는 이슈를 찾지 못했습니다.',
    description: '조건을 조금 낮추거나, GitHub에서 다음 후보를 한 번 더 조회해볼 수 있습니다.',
    buttonLabel: '다시 찾아보기',
  },
  exhausted: {
    title: '다음 목록에서도 조건에 맞는 이슈를 찾지 못했습니다.',
    description: '더 조회할 후보가 없습니다. 조건을 조금 낮추면 더 많은 이슈를 볼 수 있습니다.',
  },
}

const LOADING_BUTTON_LABEL = '조회 중'

function getCandidateNoticeState(canLoadMore: boolean, emptyFetchCount: number): CandidateNoticeState {
  if (emptyFetchCount === 0) return 'initial'
  return canLoadMore ? 'missed' : 'exhausted'
}

export function IssueCandidateLoadMoreNotice({
  isLoading,
  canLoadMore,
  emptyFetchCount,
  onLoadMoreAction,
}: IssueCandidateLoadMoreNoticeProps) {
  const noticeState = getCandidateNoticeState(canLoadMore, emptyFetchCount)
  const copy = CANDIDATE_NOTICE_COPY[noticeState]

  return (
    <Card size="sm" className="border border-dashed border-interactive-selected-border/70 bg-card/70">
      <CardContent className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-interactive-action-hover">{copy.title}</p>
          <p className="text-muted-foreground">{copy.description}</p>
        </div>
        {copy.buttonLabel ? (
          <Button
            type="button"
            variant="interactive"
            size="sm"
            className="w-fit"
            disabled={isLoading}
            onClick={onLoadMoreAction}
          >
            <Search className="size-3.5" aria-hidden="true" />
            {isLoading ? LOADING_BUTTON_LABEL : copy.buttonLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
