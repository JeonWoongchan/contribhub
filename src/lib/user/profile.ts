import sql from '@/lib/db'
import type { UserProfile } from '@/types/user'

export type OnboardingProfile = Pick<
  UserProfile,
  'topLanguages' | 'experienceLevel' | 'contributionTypes' | 'weeklyHours' | 'purpose'
>

export async function loadOnboardingProfile(
  githubUserId: string
): Promise<OnboardingProfile | null> {
  const profileRows = await sql`
    SELECT up.top_languages, up.experience_level, up.contribution_types, up.weekly_hours, up.purpose
    FROM user_profiles up
    JOIN users u ON u.id = up.user_id
    WHERE u.github_id = ${githubUserId}
      AND up.onboarding_done = true
  `

  if (profileRows.length === 0) {
    return null
  }

  const row = profileRows[0]

  return {
    topLanguages: row.top_languages ?? [],
    experienceLevel: row.experience_level,
    contributionTypes: row.contribution_types ?? [],
    weeklyHours: row.weekly_hours,
    purpose: row.purpose,
  }
}

export async function getOnboardingStatus(githubUserId: string): Promise<boolean> {
  const rows = await sql`
    SELECT up.onboarding_done
    FROM user_profiles up
    JOIN users u ON u.id = up.user_id
    WHERE u.github_id = ${githubUserId}
      AND up.onboarding_done = true
    LIMIT 1
  `

  return rows.length > 0
}
