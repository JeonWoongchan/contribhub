import { unstable_cache } from 'next/cache'
import { countUserBookmarks, listUserBookmarks } from '@/lib/bookmarks'
import { scoreIssue } from '@/lib/github/issues/scorer'
import { fetchBookmarkedIssues } from '@/lib/github/issues/bookmark'
import { loadOnboardingProfile } from '@/lib/user/profile'
import { GITHUB_API_CACHE_TTL_SECONDS } from '@/constants/scoring-rules'
import type { Bookmark } from '@/types/bookmark'
import type { IssueCardItem, RawIssue } from '@/types/issue'

type GetBookmarkListInput = {
  userId: string
  accessToken: string
  limit: number
  offset: number
}

function getBookmarkKey(bookmark: Pick<Bookmark, 'repoFullName' | 'issueNumber'>): string {
  return `${bookmark.repoFullName}#${bookmark.issueNumber}`
}

function getIssueKey(issue: Pick<RawIssue, 'number' | 'repository'>): string {
  return `${issue.repository.nameWithOwner}#${issue.number}`
}

// GitHub 조회 실패 시 DB 북마크 정보만으로 카드 아이템을 구성하는 단계.
function toFallbackIssueCardItem(bookmark: Bookmark): IssueCardItem {
  return {
    number: bookmark.issueNumber,
    title: bookmark.issueTitle,
    url: bookmark.issueUrl,
    repoFullName: bookmark.repoFullName,
    repoUrl: `https://github.com/${bookmark.repoFullName}`,
    language: null,
    stargazerCount: 0,
    labels: [],
    commentCount: 0,
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt,
    score: null,
    difficultyLevel: null,
    contributionType: bookmark.contributionType,
    competitionLevel: null,
    hasPR: false,
    isBookmarked: true,
  }
}

// 온보딩 프로필이 있을 때 채점 결과를 카드 아이템 형식으로 변환하는 단계.
function toIssueCardItemFromScoredIssue(
  githubIssue: RawIssue,
  profile: NonNullable<Awaited<ReturnType<typeof loadOnboardingProfile>>>
): IssueCardItem {
  return { ...scoreIssue(githubIssue, profile), isBookmarked: true }
}

// 온보딩 프로필이 없을 때 GitHub 원본 정보 기반 카드 아이템을 구성하는 단계.
function toIssueCardItemWithoutProfile(
  bookmark: Bookmark,
  githubIssue: RawIssue
): IssueCardItem {
  return {
    number: githubIssue.number,
    title: githubIssue.title,
    url: githubIssue.url,
    repoFullName: githubIssue.repository.nameWithOwner,
    repoUrl: githubIssue.repository.url,
    language: githubIssue.repository.primaryLanguage?.name ?? null,
    stargazerCount: githubIssue.repository.stargazerCount,
    labels: githubIssue.labels.nodes.map((label) => label.name),
    commentCount: githubIssue.comments.totalCount,
    createdAt: githubIssue.createdAt,
    updatedAt: githubIssue.updatedAt,
    score: null,
    difficultyLevel: null,
    contributionType: bookmark.contributionType,
    competitionLevel: null,
    hasPR: githubIssue.timelineItems.nodes.some((node) => node.__typename === 'CrossReferencedEvent'),
    isBookmarked: true,
  }
}

// 북마크별 카드 아이템 생성 경로를 분기하는 단계.
function toBookmarkListItem(
  bookmark: Bookmark,
  githubIssue: RawIssue | null,
  profile: Awaited<ReturnType<typeof loadOnboardingProfile>>
): IssueCardItem {
  // GitHub 이슈가 없으면 DB 북마크 정보만으로 fallback 카드 생성 단계.
  if (!githubIssue) {
    return toFallbackIssueCardItem(bookmark)
  }

  // 온보딩 프로필이 없으면 점수 계산 없이 GitHub 원본 기반 카드 생성 단계.
  if (!profile) {
    return toIssueCardItemWithoutProfile(bookmark, githubIssue)
  }

  // 온보딩 프로필이 있으면 채점 결과 기반 카드 생성 단계.
  return toIssueCardItemFromScoredIssue(githubIssue, profile)
}

export async function getBookmarkList({
  userId,
  accessToken,
  limit,
  offset,
}: GetBookmarkListInput) {
  const [bookmarks, total, profile] = await Promise.all([
    listUserBookmarks(userId, { limit, offset }),
    countUserBookmarks(userId),
    loadOnboardingProfile(userId),
  ])

  // 북마크 목록이 같으면 GitHub API 호출 결과를 캐시 — 키에 북마크 식별자 포함으로 변경 시 자동 갱신
  const bookmarkKeyStr = bookmarks.map(getBookmarkKey).sort().join(',')
  const getCachedBookmarkIssues = unstable_cache(
    () => fetchBookmarkedIssues(bookmarks, accessToken),
    ['github-bookmark-issues', userId, bookmarkKeyStr],
    { revalidate: GITHUB_API_CACHE_TTL_SECONDS }
  )
  const githubIssues = await getCachedBookmarkIssues()
  const githubIssueMap = new Map(githubIssues.map((issue) => [getIssueKey(issue), issue] as const))

  const issues = bookmarks.map((bookmark) =>
    toBookmarkListItem(bookmark, githubIssueMap.get(getBookmarkKey(bookmark)) ?? null, profile)
  )

  return {
    issues,
    pageInfo: {
      limit,
      offset,
      total,
      hasMore: offset + issues.length < total,
    },
  }
}
