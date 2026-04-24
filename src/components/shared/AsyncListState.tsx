import type { ReactNode } from 'react'

type AsyncListStatus = 'loading' | 'error' | 'done'

type AsyncListStateProps = {
  status: AsyncListStatus
  isEmpty: boolean
  loadingFallback: ReactNode
  errorFallback: ReactNode
  emptyFallback: ReactNode
  children: ReactNode
}

export function AsyncListState({
  status,
  isEmpty,
  loadingFallback,
  errorFallback,
  emptyFallback,
  children,
}: AsyncListStateProps) {
  if (status === 'loading') {
    return <>{loadingFallback}</>
  }

  if (status === 'error') {
    return <>{errorFallback}</>
  }

  if (isEmpty) {
    return <>{emptyFallback}</>
  }

  return <>{children}</>
}
