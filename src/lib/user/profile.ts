import sql from '@/lib/db'
import type { UserProfile } from '@/types/user'

export type OnboardingProfile = Pick<
  UserProfile,
  'topLanguages' | 'experienceLevel' | 'contributionTypes' | 'weeklyHours' | 'englishOk'
>

export async function loadOnboardingProfile(
  githubUserId: string
): Promise<OnboardingProfile | null> {
  const profileRows = await sql`
    SELECT up.top_languages, up.experience_level, up.contribution_types,
           up.weekly_hours, up.english_ok
    FROM user_profiles up
    JOIN users u ON u.id = up.user_id
    WHERE u.github_id = ${githubUserId}
      AND up.onboarding_done = true
  `

  if (profileRows.length === 0) return null

  const row = profileRows[0]

  return {
    topLanguages: row.top_languages ?? [],
    experienceLevel: row.experience_level,
    contributionTypes: row.contribution_types ?? [],
    weeklyHours: row.weekly_hours,
    englishOk: row.english_ok,
  }
}
