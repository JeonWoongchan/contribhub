'use client'

import { useEffect, useState } from 'react'
import type { ScoredIssue } from '@/types/issue'
import type { ContributionType } from '@/types/user'

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

type BookmarkMutationResponse =
  | { ok: true }
  | {
      ok: false
      error?: {
        message?: string
      }
    }

type IssueListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'done'
      issues: ScoredIssue[]
      partial: boolean
      failedCount: number
    }

type IssueListResult = IssueListState & {
  pendingBookmarkKeys: string[]
  refetch: () => void
  toggleBookmark: (issue: ScoredIssue) => Promise<void>
}

const DEFAULT_ERROR_MESSAGE = '오류가 발생했습니다.'
const NETWORK_ERROR_MESSAGE = '네트워크 오류가 발생했습니다.'

function getBookmarkKey(issue: Pick<ScoredIssue, 'repoFullName' | 'number'>): string {
  return `${issue.repoFullName}#${issue.number}`
}

export function useIssueList(): IssueListResult {
  const [requestId, setRequestId] = useState(0)
  const [state, setState] = useState<IssueListState>({
    status: 'loading',
  })
  const [pendingBookmarkKeys, setPendingBookmarkKeys] = useState<string[]>([])

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

  async function toggleBookmark(issue: ScoredIssue) {
    const bookmarkKey = getBookmarkKey(issue)
    const wasBookmarked = issue.isBookmarked ?? false

    setPendingBookmarkKeys((current) =>
      current.includes(bookmarkKey) ? current : [...current, bookmarkKey]
    )
    setState((current) => {
      if (current.status !== 'done') {
        return current
      }

      return {
        ...current,
        issues: current.issues.map((currentIssue) =>
          getBookmarkKey(currentIssue) === bookmarkKey
            ? { ...currentIssue, isBookmarked: !wasBookmarked }
            : currentIssue
        ),
      }
    })

    try {
      const response = await fetch('/api/bookmarks', {
        method: wasBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueNumber: issue.number,
          repoFullName: issue.repoFullName,
          issueTitle: issue.title,
          issueUrl: issue.url,
          contributionType: issue.contributionType as ContributionType | null,
        }),
      })
      const json = (await response.json()) as BookmarkMutationResponse

      if (!response.ok || !json.ok) {
        throw new Error('Bookmark request failed')
      }
    } catch {
      setState((current) => {
        if (current.status !== 'done') {
          return current
        }

        return {
          ...current,
          issues: current.issues.map((currentIssue) =>
            getBookmarkKey(currentIssue) === bookmarkKey
              ? { ...currentIssue, isBookmarked: wasBookmarked }
              : currentIssue
          ),
        }
      })
    } finally {
      setPendingBookmarkKeys((current) => current.filter((key) => key !== bookmarkKey))
    }
  }

  return {
    ...state,
    pendingBookmarkKeys,
    refetch,
    toggleBookmark,
  }
}
