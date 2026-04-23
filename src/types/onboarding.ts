import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'

export type FormState = {
  experienceLevel: ExperienceLevel | null
  contributionTypes: ContributionType[]
  topLanguages: string[]
  weeklyHours: WeeklyHours | null
  purpose: Purpose | null
}

export type OnboardingStepId =
  | 'experienceLevel'
  | 'contributionTypes'
  | 'topLanguages'
  | 'weeklyHours'
  | 'purpose'

export type OptionItem<TValue> = {
  value: TValue
  label: string
  description: string
}

export type OnboardingStepConfig = {
  id: OnboardingStepId
  label: string
}
