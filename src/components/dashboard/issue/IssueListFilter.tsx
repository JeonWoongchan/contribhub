'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { CONTRIBUTION_TYPES, EXPERIENCE_LEVELS } from '@/constants/contribution-levels'
import { SCORE_FILTER_THRESHOLDS, STAR_FILTER_THRESHOLDS } from '@/constants/scoring-rules'
import { EMPTY_ISSUE_FILTERS } from '@/types/issue'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { CompetitionLevel, IssueFilters } from '@/types/issue'
import type { ContributionType } from '@/types/user'

type IssueListFilterProps = {
    filters: IssueFilters
    availableLanguages: string[]
    onChangeAction: (filters: IssueFilters) => void
}

const COMPETITION_LEVEL_OPTIONS: { value: CompetitionLevel; label: string }[] = [
    { value: 'OPEN', label: '오픈' },
    { value: 'ACTIVE', label: '진행중' },
    { value: 'HAS_PR', label: 'PR' },
]

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
    const [open, setOpen] = useState(false)

    const toggle = <K extends keyof Omit<IssueFilters, 'contributionTypes' | 'competitionLevels'>>(key: K, value: IssueFilters[K]) => {
        onChangeAction({ ...filters, [key]: filters[key] === value ? null : value })
    }

    const toggleContributionType = (value: ContributionType) => {
        const next = filters.contributionTypes.includes(value)
            ? filters.contributionTypes.filter((t) => t !== value)
            : [...filters.contributionTypes, value]
        onChangeAction({ ...filters, contributionTypes: next })
    }

    const toggleCompetitionLevel = (value: CompetitionLevel) => {
        const next = filters.competitionLevels.includes(value)
            ? filters.competitionLevels.filter((l) => l !== value)
            : [...filters.competitionLevels, value]
        onChangeAction({ ...filters, competitionLevels: next })
    }

    const activeCount =
        (filters.language ? 1 : 0) +
        (filters.difficultyLevel ? 1 : 0) +
        filters.contributionTypes.length +
        filters.competitionLevels.length +
        (filters.minScore !== null ? 1 : 0) +
        (filters.minStars !== null ? 1 : 0)

    if (availableLanguages.length === 0) {
        return null
    }

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div className="rounded-xl border border-border/70 bg-background/70">
                <CollapsibleTrigger asChild>
                    <button
                        type="button"
                        className="group flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left"
                    >
                        <span className="text-xs font-bold text-interactive-action">필터</span>
                        {activeCount > 0 && (
                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-interactive-selected px-1 text-[10px] font-semibold text-interactive-selected-foreground">
                                {activeCount}
                            </span>
                        )}
                        {activeCount > 0 && (
                          <button
                            type="button"
                            onClick={() => onChangeAction(EMPTY_ISSUE_FILTERS)}
                            className="cursor-pointer text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                          >
                            초기화
                          </button>
                        )}
                        <ChevronDown
                            className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                        />
                    </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="relative p-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                    <div className="flex flex-col gap-2 border-t border-border/50 p-4">
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
                                    selected={filters.contributionTypes.includes(type.value)}
                                    onClickAction={() => toggleContributionType(type.value)}
                                />
                            ))}
                        </FilterRow>
                        <FilterRow label="진행 상태">
                            {COMPETITION_LEVEL_OPTIONS.map((option) => (
                                <FilterPill
                                    key={option.value}
                                    label={option.label}
                                    selected={filters.competitionLevels.includes(option.value)}
                                    onClickAction={() => toggleCompetitionLevel(option.value)}
                                />
                            ))}
                        </FilterRow>
                        <FilterRow label="스타 수">
                            {STAR_FILTER_THRESHOLDS.map((threshold) => (
                                <FilterPill
                                    key={threshold}
                                    label={`${threshold.toLocaleString()}+`}
                                    selected={filters.minStars === threshold}
                                    onClickAction={() => toggle('minStars', threshold)}
                                />
                            ))}
                        </FilterRow>
                        <FilterRow label="추천 점수">
                            {SCORE_FILTER_THRESHOLDS.map((threshold) => (
                                <FilterPill
                                    key={threshold}
                                    label={`${threshold}+`}
                                    selected={filters.minScore === threshold}
                                    onClickAction={() => toggle('minScore', threshold)}
                                />
                            ))}
                        </FilterRow>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
}
