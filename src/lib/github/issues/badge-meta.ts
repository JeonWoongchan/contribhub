import type { CompetitionLevel, DifficultyLevel } from '@/types/issue'

export type CompetitionMeta = {
  label: string
  className: string
}

export type HealthTierVariant = 'success' | 'warning' | 'danger'

export type HealthTier = {
  label: string
  variant: HealthTierVariant
  isAnimated: boolean
}

const COMPETITION_META: Record<CompetitionLevel, CompetitionMeta> = {
  OPEN: {
    label: '오픈',
    className: 'border-status-success-border bg-status-success text-status-success-foreground',
  },
  ACTIVE: {
    label: '진행중',
    className: 'border-status-warning-border bg-status-warning text-status-warning-foreground',
  },
  HAS_PR: {
    label: 'PR 있음',
    className: 'border-status-danger-border bg-status-danger text-status-danger-foreground',
  },
}

export const DIFFICULTY_LABELS_KO: Record<DifficultyLevel, string> = {
  beginner: '입문',
  junior: '주니어',
  mid: '미들',
  senior: '시니어',
}

export function getCompetitionMeta(level: CompetitionLevel): CompetitionMeta {
  return COMPETITION_META[level]
}
