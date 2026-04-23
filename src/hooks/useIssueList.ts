'use client'

import { useEffect, useState } from 'react'
import type { ScoredIssue } from '@/types/issue'

type IssueListResponse =
  | {
      ok: true
      data: {
        issues: ScoredIssue[]
        partialResults?: boolean
        failedQueryCount?: number
      }
    }
  | {
      ok: false
      error?: {
        message?: string
      }
    }

type IssueListState =
  | { status: 'loading' }
  | { status: 'error'; message: string; refetch: () => void }
  | {
      status: 'done'
      issues: ScoredIssue[]
      partial: boolean
      failedCount: number
    }

type IssueListInternalState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'done'
      issues: ScoredIssue[]
      partial: boolean
      failedCount: number
    }

const DEFAULT_ERROR_MESSAGE = '오류가 발생했어요.'
const NETWORK_ERROR_MESSAGE = '네트워크 오류가 발생했어요.'

export function useIssueList(): IssueListState {
  const [requestId, setRequestId] = useState(0)
  const [state, setState] = useState<IssueListInternalState>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    async function fetchIssues() {
      setState({ status: 'loading' })

      try {
        const response = await fetch('/api/github/issues', { signal: controller.signal })
        const json = (await response.json()) as IssueListResponse

        if (!json.ok) {
          setState({ status: 'error', message: json.error?.message ?? DEFAULT_ERROR_MESSAGE })
          return
        }

        setState({
          status: 'done',
          issues: json.data.issues,
          partial: json.data.partialResults ?? false,
          failedCount: json.data.failedQueryCount ?? 0,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setState({ status: 'error', message: NETWORK_ERROR_MESSAGE })
      }
    }

    void fetchIssues()

    return () => {
      controller.abort()
    }
  }, [requestId])

  function refetch() {
    setRequestId((value) => value + 1)
  }

  if (state.status === 'error') {
    return {
      ...state,
      refetch,
    }
  }

  return state
}
