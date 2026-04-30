'use client'

import { CONTRIBUTION_TYPES, EXPERIENCE_LEVELS } from '@/constants/contribution-levels'
import { SCORE_FILTER_THRESHOLDS } from '@/constants/scoring-rules'
import { cn } from '@/lib/utils'
import type { IssueFilters } from '@/types/issue'

type IssueListFilterProps = {
  filters: IssueFilters
  availableLanguages: string[]
  onChangeAction: (filters: IssueFilters) => void
}

function FilterPill({
  label,
  selected,
  onClickAction,
}: {
  label: string
  selected: boolean
  onClickAction: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClickAction}
      className={cn(
        'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        selected
          ? 'border-interactive-selected-border bg-interactive-selected text-interactive-selected-foreground'
          : 'border-interactive-border bg-background text-interactive-action-hover hover:border-interactive-hover-border hover:bg-interactive-hover'
      )}
    >
      {label}
    </button>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

export function IssueListFilter({ filters, availableLanguages, onChangeAction }: IssueListFilterProps) {
  const toggle = <K extends keyof IssueFilters>(key: K, value: IssueFilters[K]) => {
    onChangeAction({ ...filters, [key]: filters[key] === value ? null : value })
  }

  if (availableLanguages.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background/70 p-3">
      {availableLanguages.length > 1 ? (
        <FilterRow label="언어">
          {availableLanguages.map((language) => (
            <FilterPill
              key={language}
              label={language}
              selected={filters.language === language}
              onClickAction={() => toggle('language', language)}
            />
          ))}
        </FilterRow>
      ) : null}
      <FilterRow label="난이도">
        {EXPERIENCE_LEVELS.map((level) => (
          <FilterPill
            key={level.value}
            label={level.label}
            selected={filters.difficultyLevel === level.value}
            onClickAction={() => toggle('difficultyLevel', level.value)}
          />
        ))}
      </FilterRow>
      <FilterRow label="기여 방식">
        {CONTRIBUTION_TYPES.map((type) => (
          <FilterPill
            key={type.value}
            label={type.label}
            selected={filters.contributionType === type.value}
            onClickAction={() => toggle('contributionType', type.value)}
          />
        ))}
      </FilterRow>
      <FilterRow label="추천 점수">
        {SCORE_FILTER_THRESHOLDS.map((threshold) => (
          <FilterPill
            key={threshold}
            label={`${threshold}점+`}
            selected={filters.minScore === threshold}
            onClickAction={() => toggle('minScore', threshold)}
          />
        ))}
      </FilterRow>
    </div>
  )
}
