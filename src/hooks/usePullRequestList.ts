'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PullRequestItem, PullRequestState, PullRequestSummary } from '@/types/pull-request'

// API 응답 형식 — 목록 조회와 전체 통계 조회를 분리
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

type PRSummaryResponse =
  | {
      ok: true
      data: {
        summary: PullRequestSummary
      }
    }
  | {
      ok: false
      error?: { message?: string }
    }

// 훅 내부 상태 머신 — 초기 로딩, 에러, 데이터 준비 완료를 구분
type PRListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'done'
      allItems: PullRequestItem[]
      overallSummary: PullRequestSummary | null
    }

type PRListActions = {
  refetch: () => void
  stateFilter: PullRequestState | null
  setStateFilter: (state: PullRequestState | null) => void
}

export type PRListResult =
  | ({ status: 'loading' } & PRListActions)
  | ({ status: 'error'; message: string } & PRListActions)
  | ({
      status: 'done'
      items: PullRequestItem[]
      overallSummary: PullRequestSummary | null
    } & PRListActions)

const DEFAULT_ERROR = 'PR 목록을 불러오지 못했습니다.'
const NETWORK_ERROR = '네트워크 오류가 발생했습니다.'

// 현재 탭 상태에 맞는 PR만 클라이언트에서 필터링
function filterItems(
  items: PullRequestItem[],
  stateFilter: PullRequestState | null,
): PullRequestItem[] {
  if (stateFilter === null) {
    return items
  }

  return items.filter((item) => item.state === stateFilter)
}

export function usePullRequestList(): PRListResult {
  const [requestId, setRequestId] = useState(0) // 수동 refetch 트리거
  const [stateFilter, setStateFilter] = useState<PullRequestState | null>(null) // null = 전체
  const [state, setState] = useState<PRListState>({ status: 'loading' })

  // 최초 진입 및 refetch 시:
  // 1) 현재 페이지 목록
  // 2) 상단 고정용 전체 통계
  // 를 병렬로 가져온다.
  useEffect(() => {
    const controller = new AbortController()

    async function fetchInitialData() {
      setState({ status: 'loading' })

      try {
        const [listResponse, summaryResponse] = await Promise.all([
          fetch('/api/github/pull-requests', { signal: controller.signal }),
          fetch('/api/github/pull-requests?summaryOnly=true', { signal: controller.signal }),
        ])

        const listJson = (await listResponse.json()) as PRListResponse
        const summaryJson = (await summaryResponse.json()) as PRSummaryResponse

        if (!listJson.ok) {
          setState({ status: 'error', message: listJson.error?.message ?? DEFAULT_ERROR })
          return
        }

        setState({
          status: 'done',
          allItems: listJson.data.items,
          overallSummary: summaryJson.ok ? summaryJson.data.summary : null,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState({ status: 'error', message: NETWORK_ERROR })
      }
    }

    void fetchInitialData()
    return () => controller.abort()
  }, [requestId])

  // 탭 전환은 서버 재조회 대신 이미 로드된 목록을 로컬 필터링한다.
  const items = useMemo(() => {
    if (state.status !== 'done') return []
    return filterItems(state.allItems, stateFilter)
  }, [state, stateFilter])

  function refetch() {
    setRequestId((value) => value + 1)
  }

  const actions: PRListActions = {
    refetch,
    stateFilter,
    setStateFilter,
  }

  if (state.status === 'loading') {
    return {
      status: 'loading',
      ...actions,
    }
  }

  if (state.status === 'error') {
    return {
      status: 'error',
      message: state.message,
      ...actions,
    }
  }

  return {
    status: 'done',
    items,
    overallSummary: state.overallSummary,
    ...actions,
  }
}
