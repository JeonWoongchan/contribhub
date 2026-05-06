'use client'

import { useEffect, useRef, useState } from 'react'
import type { IssueFilters } from '@/types/issue'

type UseIssueCandidateLoadMoreFeedbackParams = {
  filters: IssueFilters
  issueCount: number
  isFetchingNextPage: boolean
  canLoadMoreCandidates: boolean
  fetchMoreCandidatesAction: () => Promise<void>
}

const CONTRIBUTION_TYPE_KEY_SEPARATOR = ','

export type IssueCandidateLoadMoreFeedback = {
  emptyCandidateFetchCount: number
  shouldShowCandidateLoadMoreNotice: boolean
  loadMoreCandidatesAction: () => void
}

export function useIssueCandidateLoadMoreFeedback({
  filters,
  issueCount,
  isFetchingNextPage,
  canLoadMoreCandidates,
  fetchMoreCandidatesAction,
}: UseIssueCandidateLoadMoreFeedbackParams): IssueCandidateLoadMoreFeedback {
  const [emptyCandidateFetchCount, setEmptyCandidateFetchCount] = useState(0)
  const candidateFetchIssueCountRef = useRef<number | null>(null)
  const contributionTypesKey = filters.contributionTypes.join(CONTRIBUTION_TYPE_KEY_SEPARATOR)

  useEffect(() => {
    setEmptyCandidateFetchCount(0)
    candidateFetchIssueCountRef.current = null
  }, [
    filters.language,
    filters.difficultyLevel,
    contributionTypesKey,
    filters.minScore,
    filters.minStars,
  ])

  useEffect(() => {
    if (isFetchingNextPage || candidateFetchIssueCountRef.current === null) {
      return
    }

    const previousIssueCount = candidateFetchIssueCountRef.current
    candidateFetchIssueCountRef.current = null
    setEmptyCandidateFetchCount((count) => issueCount > previousIssueCount ? 0 : count + 1)
  }, [isFetchingNextPage, issueCount])

  const loadMoreCandidatesAction = () => {
    if (!canLoadMoreCandidates || isFetchingNextPage) {
      return
    }

    candidateFetchIssueCountRef.current = issueCount
    void fetchMoreCandidatesAction()
  }

  return {
    emptyCandidateFetchCount,
    shouldShowCandidateLoadMoreNotice: canLoadMoreCandidates || emptyCandidateFetchCount > 0,
    loadMoreCandidatesAction,
  }
}
