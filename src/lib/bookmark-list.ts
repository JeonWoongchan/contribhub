import { countUserBookmarks, listUserBookmarks } from '@/lib/bookmarks'
import { fetchBookmarkedIssues } from '@/lib/github/bookmark-issues'

type GetBookmarkListInput = {
  userId: string
  accessToken: string
  limit: number
  offset: number
}

export async function getBookmarkList({
  userId,
  accessToken,
  limit,
  offset,
}: GetBookmarkListInput) {
  // DB에서 북마크 목록 및 전체 개수 조회 단계.
  const [bookmarks, total] = await Promise.all([
    listUserBookmarks(userId, { limit, offset }),
    countUserBookmarks(userId),
  ])

  // 북마크 기준 GitHub 이슈 정보 조회 단계.
  const githubIssues = await fetchBookmarkedIssues(bookmarks, accessToken)

  // GitHub 이슈 조회 결과 맵 구성 단계.
  const githubIssueMap = new Map(
    githubIssues.map((issue) => [`${issue.repository.nameWithOwner}#${issue.number}`, issue] as const)
  )

  // DB 북마크와 GitHub 이슈 정보 머지 단계.
  const mergedBookmarks = bookmarks.map((bookmark) => ({
    ...bookmark,
    githubIssue: githubIssueMap.get(`${bookmark.repoFullName}#${bookmark.issueNumber}`) ?? null,
  }))

  // 북마크 목록 응답 데이터 반환 단계.
  return {
    bookmarks: mergedBookmarks,
    pageInfo: {
      limit,
      offset,
      total,
      hasMore: offset + mergedBookmarks.length < total,
    },
  }
}
