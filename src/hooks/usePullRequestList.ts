'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PullRequestItem, PullRequestState, PullRequestSummary } from '@/types/pull-request'

// API 응답 형식 — 전체 목록과 통계를 단일 응답으로 수신
type PRListResponse =
  | {
      ok: true
      data: {
        items: PullRequestItem[]
        summary: PullRequestSummary
      }
    }
  | {
      ok: false
      error?: { message?: string }
    }

// 훅 내부 상태 머신 — 로딩/에러/완료를 구분
type PRListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'done'
      allItems: PullRequestItem[]  // 탭 필터링 전 전체 목록
      summary: PullRequestSummary  // 전체 기준 통계
    }

type PRListActions = {
  refetch: () => void
  stateFilter: PullRequestState | null
  setStateFilter: (state: PullRequestState | null) => void
}

// 컴포넌트에 노출되는 훅 반환 타입 — status에 따라 사용 가능한 필드가 달라짐
export type PRListResult =
  | ({ status: 'loading' } & PRListActions)
  | ({ status: 'error'; message: string } & PRListActions)
  | ({
      status: 'done'
      items: PullRequestItem[]      // 탭 필터 적용된 목록
      summary: PullRequestSummary   // 탭 필터와 무관한 전체 통계
    } & PRListActions)

const DEFAULT_ERROR = 'PR 목록을 불러오지 못했습니다.'
const NETWORK_ERROR = '네트워크 오류가 발생했습니다.'

// 전체 목록에서 상태별 필터링
function filterByState(
  items: PullRequestItem[],
  stateFilter: PullRequestState | null,
): PullRequestItem[] {
  if (stateFilter === null) return items
  return items.filter((item) => item.state === stateFilter)
}

export function usePullRequestList(): PRListResult {
  const [requestId, setRequestId] = useState(0) // 수동 refetch 트리거
  const [stateFilter, setStateFilter] = useState<PullRequestState | null>(null) // null = 전체
  const [state, setState] = useState<PRListState>({ status: 'loading' })

  // 마운트 및 refetch 시 전체 PR을 한 번에 요청 — 목록과 통계를 동시에 수신
  useEffect(() => {
    const controller = new AbortController()

    async function fetchData() {
      setState({ status: 'loading' })

      try {
        const response = await fetch('/api/github/pull-requests', { signal: controller.signal })
        const json = (await response.json()) as PRListResponse

        if (!json.ok) {
          setState({ status: 'error', message: json.error?.message ?? DEFAULT_ERROR })
          return
        }

        setState({
          status: 'done',
          allItems: json.data.items,
          summary: json.data.summary,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState({ status: 'error', message: NETWORK_ERROR })
      }
    }

    void fetchData()
    return () => controller.abort()
  }, [requestId])

  // 탭 전환은 서버 재요청 없이 목록에서 필터링
  const items = useMemo(() => {
    if (state.status !== 'done') return []
    return filterByState(state.allItems, stateFilter)
  }, [state, stateFilter])

  function refetch() {
    setRequestId((value) => value + 1)
  }

  const actions: PRListActions = { refetch, stateFilter, setStateFilter }

  if (state.status === 'loading') return { status: 'loading', ...actions }
  if (state.status === 'error') return { status: 'error', message: state.message, ...actions }

  return {
    status: 'done',
    items,
    summary: state.summary,
    ...actions,
  }
}
