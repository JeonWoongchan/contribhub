import { githubGraphQL } from '@/lib/github/client'
import type { Bookmark } from '@/types/bookmark'
import type { RawIssue } from '@/types/issue'

type RepositoryIssueNode = {
  issueOrPullRequest: RawIssue | null
}

type BookmarkIssuesQueryResult = Record<string, RepositoryIssueNode | null>

// 배열을 고정 크기 단위로 분할하는 유틸 함수.
function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

// 북마크 목록 기반 GitHub GraphQL 조회 쿼리 생성 함수.
function buildBookmarkIssuesQuery(bookmarks: Bookmark[]): string {
  const selections = bookmarks
    .map((bookmark, index) => {
      const [owner, name] = bookmark.repoFullName.split('/')

      return `
        issue_${index}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) {
          issueOrPullRequest(number: ${bookmark.issueNumber}) {
            ... on Issue {
              number
              title
              url
              body
              createdAt
              updatedAt
              comments { totalCount }
              labels(first: 10) {
                nodes { name }
              }
              repository {
                nameWithOwner
                primaryLanguage { name }
                stargazerCount
              }
              timelineItems(first: 5, itemTypes: [CROSS_REFERENCED_EVENT]) {
                nodes {
                  __typename
                  ... on CrossReferencedEvent {
                    source {
                      __typename
                    }
                  }
                }
              }
            }
          }
        }
      `
    })
    .join('\n')

  return `query FetchBookmarkIssues {${selections}\n}`
}

// 북마크 기준 GitHub 이슈 정보 조회 함수.
export async function fetchBookmarkedIssues(
  bookmarks: Bookmark[],
  accessToken: string
): Promise<RawIssue[]> {
  // 조회 대상 북마크가 없을 때의 조기 반환 단계.
  if (bookmarks.length === 0) {
    return []
  }

  // GitHub 요청 크기 제한 대응을 위한 북마크 청크 분할 단계.
  const chunks = chunkArray(bookmarks, 20)

  // 청크별 GitHub GraphQL 요청 병렬 실행 단계.
  // 일부 요청 실패가 전체 실패로 전파되지 않도록 allSettled 사용.
  const settled = await Promise.allSettled(
    chunks.map((chunk) =>
      githubGraphQL<BookmarkIssuesQueryResult>(buildBookmarkIssuesQuery(chunk), {}, accessToken)
    )
  )

  // 성공한 요청만 추출한 뒤 GraphQL 응답 객체를 RawIssue 배열로 평탄화하는 단계.
  return settled
    .filter(
      (result): result is PromiseFulfilledResult<BookmarkIssuesQueryResult> =>
        result.status === 'fulfilled'
    )
    .flatMap((result) =>
      Object.values(result.value)
        .map((entry) => entry?.issueOrPullRequest)
        .filter((issue): issue is RawIssue => issue !== null)
    )
}
