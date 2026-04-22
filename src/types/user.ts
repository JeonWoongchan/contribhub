export type ExperienceLevel = 'beginner' | 'junior' | 'mid' | 'senior'
export type ContributionType = 'doc' | 'bug' | 'feat' | 'test' | 'review'
export type Purpose = 'portfolio' | 'growth' | 'community'
export type WeeklyHours = 2 | 5 | 10

export interface UserProfile {
    id: string
    userId: string
    topLanguages: string[]
    experienceLevel: ExperienceLevel | null
    contributionTypes: ContributionType[]
    weeklyHours: WeeklyHours | null
    englishOk: boolean
    purpose: Purpose | null
    onboardingDone: boolean
    updatedAt: string
}

export interface OnboardingSurvey {
  experienceLevel: ExperienceLevel
  contributionTypes: ContributionType[]
  topLanguages: string[]
  weeklyHours: WeeklyHours
  englishOk: boolean
  purpose: Purpose
}

// 온보딩 단계 정의
export interface SurveyStepConfig {
    step: number
    title: string
    description: string
    field: keyof OnboardingSurvey
}

