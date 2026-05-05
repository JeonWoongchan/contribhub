'use client'

import { useEffect, useState } from 'react'
import { isUnauthorizedApiResponse, redirectToLogin } from '@/lib/client-auth'
import type { ApiResponse } from '@/types/api'
import type { IssueCardItem } from '@/types/issue'
import type { ContributionType } from '@/types/user'

type UseIssueBookmarksOptions = {
  sourceIssues: IssueCardItem[]
  isSourceIssuesReady: boolean
  removeOnUnbookmark?: boolean
  onMutationSuccessAction?: () => void | Promise<void>
}

// 카드 단위 북마크 식별 키 생성 유틸리티 함수 선언부.
function getBookmarkKey(issue: Pick<IssueCardItem, 'repoFullName' | 'number'>): string {
  return `${issue.repoFullName}#${issue.number}`
}

export function useIssueBookmarks({
  sourceIssues,
  isSourceIssuesReady,
  removeOnUnbookmark = false,
  onMutationSuccessAction,
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

    // 무한 스크롤로 sourceIssues가 교체될 때 낙관적 isBookmarked 상태를 보존하는 병합 처리부.
    // 단순 교체(setOptimisticIssues(sourceIssues))를 하면 pending 중이거나 이미 반영된
    // 낙관적 북마크 상태가 서버 원본값으로 덮어씌워진다.
    setOptimisticIssues((current) => {
      const bookmarkStateMap = new Map(
        current.map((i) => [getBookmarkKey(i), i.isBookmarked])
      )
      return sourceIssues.map((issue) => {
        const key = getBookmarkKey(issue)
        const optimisticBookmarked = bookmarkStateMap.get(key)
        // 낙관적 상태가 존재하는 항목은 isBookmarked를 유지하고 나머지 필드는 최신값으로 교체
        return optimisticBookmarked !== undefined
          ? { ...issue, isBookmarked: optimisticBookmarked }
          : issue
      })
    })
  }, [isSourceIssuesReady, sourceIssues])

  // 대시보드 이슈 카드 기준 북마크 저장 및 해제 토글 처리부.
  async function toggleBookmark(issue: IssueCardItem) {
    const bookmarkKey = getBookmarkKey(issue)
    const wasBookmarked = issue.isBookmarked ?? false

    // 중복 클릭 방지를 위한 요청 중 상태 등록부.
    setPendingBookmarkKeys((current) =>
      current.includes(bookmarkKey) ? current : [...current, bookmarkKey]
    )

    // 응답 대기 전 UI를 즉시 반영하기 위한 낙관적 업데이트 처리부.
    // removeOnUnbookmark 모드에서 북마크 해제 시 목록에서 즉시 제거하고,
    // 그 외에는 해당 항목의 isBookmarked만 반전.
    setOptimisticIssues((current) => {
      if (removeOnUnbookmark && wasBookmarked) {
        return current.filter((i) => getBookmarkKey(i) !== bookmarkKey)
      }
      return current.map((i) =>
        getBookmarkKey(i) === bookmarkKey ? { ...i, isBookmarked: !wasBookmarked } : i
      )
    })

    // 실패 시 해당 이슈 하나만 이전 북마크 상태로 되돌리는 함수형 롤백 선언부.
    // snapshot 전체 복원 대신 현재 상태에서 bookmarkKey 항목만 수정하므로
    // 동시에 진행 중인 다른 이슈의 낙관적 업데이트에 간섭 없음.
    // removeOnUnbookmark 케이스: 낙관적으로 삭제된 항목을 목록 끝에 재삽입.
    // (원래 순서 복원 불가 — 네트워크 실패라는 희귀 케이스에 한정되므로 수용)
    function undoOptimisticUpdate() {
      setOptimisticIssues((current) => {
        if (removeOnUnbookmark && wasBookmarked) {
          // 중복 삽입 방지 — 이미 목록에 있으면 현재 상태 유지
          if (current.some((i) => getBookmarkKey(i) === bookmarkKey)) return current
          return [...current, { ...issue, isBookmarked: true }]
        }
        return current.map((i) =>
          getBookmarkKey(i) === bookmarkKey ? { ...i, isBookmarked: wasBookmarked } : i
        )
      })
    }

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
      const json = (await response.json()) as ApiResponse<{ saved?: boolean; deleted?: boolean }>

      if (isUnauthorizedApiResponse(response, json)) {
        redirectToLogin()
        undoOptimisticUpdate()
        return
      }

      // 비정상 응답 발생 시 낙관적 업데이트 롤백 실행부.
      if (!response.ok || !json.ok) {
        undoOptimisticUpdate()
        return
      }

      await onMutationSuccessAction?.()
    } catch {
      // 네트워크 예외 발생 시 낙관적 업데이트 롤백 실행부.
      undoOptimisticUpdate()
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
