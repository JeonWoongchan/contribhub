import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'

export type FormState = {
  experienceLevel: ExperienceLevel | null
  contributionTypes: ContributionType[]
  weeklyHours: WeeklyHours | null
  englishOk: boolean
  purpose: Purpose | null
}

export type OnboardingStepId =
  | 'experienceLevel'
  | 'contributionTypes'
  | 'weeklyHours'
  | 'englishOk'
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
