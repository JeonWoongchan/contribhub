import { countUserBookmarks, listUserBookmarks } from '@/lib/bookmarks'
import { getRepoHealthMap } from '@/lib/github/issues/health'
import { scoreIssue } from '@/lib/github/issues/scorer'
import { fetchBookmarkedIssues } from '@/lib/github/issues/bookmark'
import { loadOnboardingProfile } from '@/lib/user/profile'
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
    healthScore: null,
  }
}

// 온보딩 프로필이 있을 때 채점 결과를 카드 아이템 형식으로 변환하는 단계.
function toIssueCardItemFromScoredIssue(
  healthMap: Map<string, number>,
  githubIssue: RawIssue,
  profile: NonNullable<Awaited<ReturnType<typeof loadOnboardingProfile>>>
): IssueCardItem {
  const scoredIssue = scoreIssue(
    githubIssue,
    profile,
    healthMap.get(githubIssue.repository.nameWithOwner) ?? null
  )

  return {
    number: scoredIssue.number,
    title: scoredIssue.title,
    url: scoredIssue.url,
    repoFullName: scoredIssue.repoFullName,
    repoUrl: scoredIssue.repoUrl,
    language: scoredIssue.language,
    stargazerCount: scoredIssue.stargazerCount,
    labels: scoredIssue.labels,
    commentCount: scoredIssue.commentCount,
    createdAt: scoredIssue.createdAt,
    updatedAt: scoredIssue.updatedAt,
    score: scoredIssue.score,
    difficultyLevel: scoredIssue.difficultyLevel,
    contributionType: scoredIssue.contributionType,
    competitionLevel: scoredIssue.competitionLevel,
    hasPR: scoredIssue.hasPR,
    isBookmarked: true,
    healthScore: scoredIssue.healthScore,
  }
}

// 온보딩 프로필이 없을 때 GitHub 원본 정보 기반 카드 아이템을 구성하는 단계.
function toIssueCardItemWithoutProfile(
  bookmark: Bookmark,
  githubIssue: RawIssue,
  healthMap: Map<string, number>
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
    healthScore: healthMap.get(githubIssue.repository.nameWithOwner) ?? null,
  }
}

// 북마크별 카드 아이템 생성 경로를 분기하는 단계.
function toBookmarkListItem(
  bookmark: Bookmark,
  githubIssue: RawIssue | null,
  healthMap: Map<string, number>,
  profile: Awaited<ReturnType<typeof loadOnboardingProfile>>
): IssueCardItem {
  // GitHub 이슈가 없으면 DB 북마크 정보만으로 fallback 카드 생성 단계.
  if (!githubIssue) {
    return toFallbackIssueCardItem(bookmark)
  }

  // 온보딩 프로필이 없으면 점수 계산 없이 GitHub 원본 기반 카드 생성 단계.
  if (!profile) {
    return toIssueCardItemWithoutProfile(bookmark, githubIssue, healthMap)
  }

  // 온보딩 프로필이 있으면 채점 결과 기반 카드 생성 단계.
  return toIssueCardItemFromScoredIssue(healthMap, githubIssue, profile)
}

export async function getBookmarkList({
  userId,
  accessToken,
  limit,
  offset,
}: GetBookmarkListInput) {
  // 북마크 목록 및 전체 개수 조회 단계.
  const [bookmarks, total, profile] = await Promise.all([
    listUserBookmarks(userId, { limit, offset }),
    countUserBookmarks(userId),
    loadOnboardingProfile(userId),
  ])

  // 북마크 기준 GitHub 이슈 정보 조회 단계.
  const githubIssues = await fetchBookmarkedIssues(bookmarks, accessToken)

  // 북마크 카드 표시용 저장소 health 점수 조회 단계.
  const healthMap = await getRepoHealthMap(
    [...new Set(githubIssues.map((issue) => issue.repository.nameWithOwner))],
    accessToken
  )

  // GitHub 이슈 조회 결과 맵 구성 단계.
  const githubIssueMap = new Map(githubIssues.map((issue) => [getIssueKey(issue), issue] as const))

  // 북마크 목록을 공통 이슈 카드 형식으로 변환하는 단계.
  const issues = bookmarks.map((bookmark) =>
    toBookmarkListItem(bookmark, githubIssueMap.get(getBookmarkKey(bookmark)) ?? null, healthMap, profile)
  )

  // 북마크 목록 응답 데이터 반환 단계.
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
