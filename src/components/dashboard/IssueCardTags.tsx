import { Badge } from '@/components/ui/badge'
import { DIFFICULTY_LABELS_KO } from '@/lib/github/issue-badge-meta'
import type { DifficultyLevel } from '@/types/issue'

type IssueCardTagsProps = {
  difficultyLevel: DifficultyLevel | null
  labels: string[]
  language: string | null
}

export function IssueCardTags({ difficultyLevel, labels, language }: IssueCardTagsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {language && (
        <Badge
          variant="outline"
          className="rounded-md border-interactive-selected-border bg-interactive-selected text-interactive-selected-foreground"
        >
          {language}
        </Badge>
      )}
      {difficultyLevel && (
        <Badge variant="secondary" className="rounded-md">
          {DIFFICULTY_LABELS_KO[difficultyLevel]}
        </Badge>
      )}
      {labels.slice(0, 2).map((label) => (
        <Badge key={label} variant="outline" className="rounded-md text-muted-foreground">
          {label}
        </Badge>
      ))}
    </div>
  )
}
