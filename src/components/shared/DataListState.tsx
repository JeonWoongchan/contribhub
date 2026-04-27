import type { ReactNode } from 'react'
import { CardListEmpty } from '@/components/shared/CardListEmpty'
import { CardListError } from '@/components/shared/CardListError'
import { CardListSkeleton } from '@/components/shared/CardListSkeleton'

type DataListStateProps<T> = {
  isPending: boolean
  isError: boolean
  items: T[]
  errorMessage?: string
  onRetry?: () => void
  skeletonCount?: number
  emptyTitle: string
  emptyDescription: string
  emptyDetail?: string
  emptyAction?: ReactNode
  renderContent: () => ReactNode
}

export function DataListState<T>({
  isPending,
  isError,
  items,
  errorMessage,
  onRetry,
  skeletonCount,
  emptyTitle,
  emptyDescription,
  emptyDetail,
  emptyAction,
  renderContent,
}: DataListStateProps<T>) {
  if (isPending) {
    return <CardListSkeleton count={skeletonCount} />
  }

  if (isError) {
    return <CardListError message={errorMessage ?? '목록을 불러오지 못했습니다.'} onRetry={onRetry} />
  }

  if (items.length === 0) {
    return (
      <CardListEmpty
        title={emptyTitle}
        description={emptyDescription}
        detail={emptyDetail}
        action={emptyAction}
      />
    )
  }

  return <>{renderContent()}</>
}
