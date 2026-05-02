import { z } from 'zod'

// src/types/user.ts의 OnboardingSurvey와 구조적으로 동일하게 유지해야 함
export const onboardingSurveySchema = z.object({
    experienceLevel: z.enum(['beginner', 'junior', 'mid', 'senior']),
    contributionTypes: z.array(z.enum(['doc', 'bug', 'feat', 'test', 'review'])).min(1),
    topLanguages: z.array(z.string().min(1)).min(1),
    // WeeklyHours 허용값 외 숫자는 거부
    weeklyHours: z.union([z.literal(2), z.literal(5), z.literal(10)]),
    purpose: z.enum(['portfolio', 'growth', 'community']),
})
