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
  COMPETITIVE: {
    label: '활동 많음',
    className: 'border-status-warning-border bg-status-warning text-status-warning-foreground',
  },
  TAKEN: {
    label: 'PR 있음',
    className: 'border-status-danger-border bg-status-danger text-status-danger-foreground',
  },
}

export const DIFFICULTY_LABELS_KO: Record<DifficultyLevel, string> = {
  beginner: '입문',
  junior: '주니어',
  mid: '미드',
  senior: '시니어',
}

// 경쟁 상태를 표시용 메타 정보로 변환하는 함수.
export function getCompetitionMeta(level: CompetitionLevel): CompetitionMeta {
  return COMPETITION_META[level]
}
