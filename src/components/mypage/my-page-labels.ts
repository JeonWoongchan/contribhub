import { CONTRIBUTION_TYPES, EXPERIENCE_LEVELS, PURPOSES, WEEKLY_HOURS } from '@/constants/contribution-levels'
import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'

export function renderMyPageValue(value: string | null): string {
  return value ?? '아직 설정되지 않았습니다.'
}

export function getExperienceLevelLabel(value: ExperienceLevel | null): string | null {
  return EXPERIENCE_LEVELS.find((level) => level.value === value)?.label ?? null
}

export function getContributionTypeLabel(value: ContributionType): string {
  return CONTRIBUTION_TYPES.find((type) => type.value === value)?.label ?? value
}

export function getWeeklyHoursLabel(value: WeeklyHours | null): string | null {
  return WEEKLY_HOURS.find((hours) => hours.value === value)?.label ?? null
}

export function getPurposeLabel(value: Purpose | null): string | null {
  return PURPOSES.find((purpose) => purpose.value === value)?.label ?? null
}
