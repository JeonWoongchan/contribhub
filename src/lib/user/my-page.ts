import { unstable_cache } from 'next/cache'
import { GITHUB_API_CACHE_TTL_SECONDS } from '@/constants/scoring-rules'
import sql from '@/lib/db'
import { countUserBookmarks } from '@/lib/bookmarks'
import { fetchViewerPullRequests } from '@/lib/github/pull-requests'
import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'

type MyPageUserRow = {
  github_login: string
  avatar_url: string | null
  created_at: Date | string
  top_languages: string[] | null
  experience_level: ExperienceLevel | null
  contribution_types: ContributionType[] | null
  weekly_hours: WeeklyHours | null
  purpose: Purpose | null
  updated_at: Date | string | null
}


export type MyPageData = {
  profile: {
    name: string | null
    login: string
    image: string | null
    joinedAt: string
    githubProfileUrl: string
  }
  onboarding: {
    topLanguages: string[]
    experienceLevel: ExperienceLevel | null
    contributionTypes: ContributionType[]
    weeklyHours: WeeklyHours | null
    purpose: Purpose | null
    updatedAt: string | null
  }
}

export type MyPageActivity = {
  bookmarkCount: number
  pullRequestCount: number
  mergedPullRequestCount: number
}

function toIsoString(value: Date | string | null): string | null {
  if (!value) {
    return null
  }

  return value instanceof Date ? value.toISOString() : String(value)
}

export async function getMyPageData(
  githubUserId: string,
  name: string | null
): Promise<MyPageData | null> {
  const userRows = (await sql`
    SELECT
      u.github_login,
      u.avatar_url,
      u.created_at,
      up.top_languages,
      up.experience_level,
      up.contribution_types,
      up.weekly_hours,
      up.purpose,
      up.updated_at
    FROM users u
    LEFT JOIN user_profiles up
      ON up.user_id = u.id
      AND up.onboarding_done = true
    WHERE u.github_id = ${githubUserId}
    LIMIT 1
  `) as MyPageUserRow[]

  const user = userRows[0]

  if (!user) {
    return null
  }

  return {
    profile: {
      name,
      login: user.github_login,
      image: user.avatar_url,
      joinedAt: toIsoString(user.created_at) ?? new Date().toISOString(),
      githubProfileUrl: `https://github.com/${user.github_login}`,
    },
    onboarding: {
      topLanguages: user.top_languages ?? [],
      experienceLevel: user.experience_level,
      contributionTypes: user.contribution_types ?? [],
      weeklyHours: user.weekly_hours,
      purpose: user.purpose,
      updatedAt: toIsoString(user.updated_at),
    },
  }
}

export async function getMyPageActivity(
  githubUserId: string,
  accessToken: string,
  viewerLogin: string
): Promise<MyPageActivity> {
  const getCachedPullRequests = unstable_cache(
    () => fetchViewerPullRequests({ accessToken, viewerLogin }),
    ['my-page-pull-requests', githubUserId],
    { revalidate: GITHUB_API_CACHE_TTL_SECONDS }
  )

  const [bookmarkCount, pullRequestResult] = await Promise.all([
    countUserBookmarks(githubUserId),
    getCachedPullRequests(),
  ])

  return {
    bookmarkCount,
    pullRequestCount: pullRequestResult.summary.totalCount,
    mergedPullRequestCount: pullRequestResult.summary.mergedCount,
  }
}
