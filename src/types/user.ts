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
  purpose: Purpose | null
  onboardingDone: boolean
  updatedAt: string
}

export interface OnboardingSurvey {
  experienceLevel: ExperienceLevel
  contributionTypes: ContributionType[]
  topLanguages: string[]
  weeklyHours: WeeklyHours
  purpose: Purpose
}

export interface SurveyStepConfig {
  step: number
  title: string
  description: string
  field: keyof OnboardingSurvey
}
