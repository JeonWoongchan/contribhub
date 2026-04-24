'use client'

import { useEffect, useState } from 'react'
import type { IssueCardItem } from '@/types/issue'
import type { ContributionType } from '@/types/user'

type IssueBookmarksResponse =
  | { ok: true }
  | {
      ok: false
      error?: {
        message?: string
      }
    }

type UseIssueBookmarksOptions = {
  sourceIssues: IssueCardItem[]
  isSourceIssuesReady: boolean
}

// 카드 단위 북마크 식별 키 생성 유틸리티 함수 선언부.
function getBookmarkKey(issue: Pick<IssueCardItem, 'repoFullName' | 'number'>): string {
  return `${issue.repoFullName}#${issue.number}`
}

// 추천 이슈 목록을 북마크 토글 가능한 낙관적 상태로 관리하고 북마크 등록, 삭제, pending 및 rollback을 담당하는 훅
export function useIssueBookmarks({
  sourceIssues,
  isSourceIssuesReady,
}: UseIssueBookmarksOptions) {
  // 북마크 토글 결과를 반영하는 낙관적 이슈 목록 상태 선언부.
  // 추천 이슈 목록을 복사하고 북마크 여부를 추가 관리해서 사용
  const [optimisticIssues, setOptimisticIssues] = useState<IssueCardItem[]>([])

  // 북마크 저장 및 삭제 요청 진행 중인 카드 키 목록 상태 선언부.
  const [pendingBookmarkKeys, setPendingBookmarkKeys] = useState<string[]>([])

  useEffect(() => {
    if (!isSourceIssuesReady) {
      return
    }

    // 서버에서 받은 최신 이슈 목록을 낙관적 상태의 기준값으로 동기화하는 처리부.
    setOptimisticIssues(sourceIssues)
  }, [isSourceIssuesReady, sourceIssues])

  // 북마크 토글 실패 시 원래 상태로 복구하는 롤백 처리부.
  function rollbackBookmark(bookmarkKey: string, wasBookmarked: boolean) {
    setOptimisticIssues((current) =>
      current.map((currentIssue) =>
        getBookmarkKey(currentIssue) === bookmarkKey
          ? { ...currentIssue, isBookmarked: wasBookmarked }
          : currentIssue
      )
    )
  }

  // 대시보드 이슈 카드 기준 북마크 저장 및 해제 토글 처리부.
  async function toggleBookmark(issue: IssueCardItem) {
    const bookmarkKey = getBookmarkKey(issue)
    const wasBookmarked = issue.isBookmarked ?? false

    // 중복 클릭 방지를 위한 요청 중 상태 등록부.
    setPendingBookmarkKeys((current) =>
      current.includes(bookmarkKey) ? current : [...current, bookmarkKey]
    )

    // 응답 대기 전 UI를 즉시 반영하기 위한 낙관적 업데이트 처리부.
    setOptimisticIssues((current) =>
      current.map((currentIssue) =>
        getBookmarkKey(currentIssue) === bookmarkKey
          ? { ...currentIssue, isBookmarked: !wasBookmarked }
          : currentIssue
      )
    )

    try {
      // 서버 북마크 저장 및 삭제 요청 전송부.
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
      const json = (await response.json()) as IssueBookmarksResponse

      // 비정상 응답 발생 시 상태 복구 처리부.
      if (!response.ok || !json.ok) {
        rollbackBookmark(bookmarkKey, wasBookmarked)
        return
      }
    } catch {
      // 네트워크 예외 발생 시 상태 복구 처리부.
      rollbackBookmark(bookmarkKey, wasBookmarked)
    } finally {
      // 요청 완료 후 pending 상태 해제 처리부.
      setPendingBookmarkKeys((current) => current.filter((key) => key !== bookmarkKey))
    }
  }

  // 북마크 상호작용에 필요한 공개 인터페이스 반환부.
  return {
    optimisticIssues,
    pendingBookmarkKeys,
    toggleBookmark,
  }
}
