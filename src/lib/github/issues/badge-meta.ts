import type { CompetitionLevel, DifficultyLevel } from '@/types/issue'
import type { PullRequestState } from '@/types/pull-request'

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

export type PRStateMeta = { label: string; className: string }

export const PR_STATE_META: Record<PullRequestState, PRStateMeta> = {
  OPEN: { label: '진행중', className: 'border-brand-subtle-border bg-interactive-action text-interactive-action-foreground' },
  MERGED: { label: '병합됨', className: 'border-status-success-border bg-status-success text-status-success-foreground' },
  CLOSED: { label: '닫힘', className: 'border-status-danger-border bg-status-danger text-status-danger-foreground' },
}
