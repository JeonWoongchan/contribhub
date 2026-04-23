import sql from '@/lib/db'
import type { OnboardingSurvey } from '@/types/user'

export async function saveOnboardingSurvey(
  githubUserId: string,
  survey: OnboardingSurvey
): Promise<void> {
  const { experienceLevel, contributionTypes, topLanguages, weeklyHours, purpose } = survey

  await sql`
    INSERT INTO user_profiles (
      user_id,
      top_languages,
      experience_level,
      contribution_types,
      weekly_hours,
      purpose,
      onboarding_done,
      updated_at
    )
    VALUES (
      (SELECT id FROM users WHERE github_id = ${githubUserId}),
      ${topLanguages},
      ${experienceLevel},
      ${contributionTypes},
      ${weeklyHours},
      ${purpose},
      true,
      NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      top_languages = EXCLUDED.top_languages,
      experience_level = EXCLUDED.experience_level,
      contribution_types = EXCLUDED.contribution_types,
      weekly_hours = EXCLUDED.weekly_hours,
      purpose = EXCLUDED.purpose,
      onboarding_done = true,
      updated_at = NOW()
  `
}
