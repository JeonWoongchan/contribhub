import { POPULAR_LANGUAGES } from '@/constants/contribution-levels'
import { OptionCard } from '../OptionCard'
import { StepSection } from '../StepSection'

type LanguagesStepProps = {
  value: string[]
  onToggle: (language: string) => void
  onToggleAll: () => void
}

const LAST_ROW_LANGUAGES = ['PHP'] as const

export function LanguagesStep({ value, onToggle, onToggleAll }: LanguagesStepProps) {
  const mainLanguages = POPULAR_LANGUAGES.filter(
    (language) => !LAST_ROW_LANGUAGES.includes(language as (typeof LAST_ROW_LANGUAGES)[number])
  )
  const isAllSelected = value.length === POPULAR_LANGUAGES.length

  return (
    <StepSection
      title="어떤 언어로 기여하고 싶나요?"
      description="사용자의 GitHub 데이터 기반으로 자동 선택되어 있어요."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {mainLanguages.map((language) => (
          <OptionCard
            key={language}
            label={language}
            description=""
            selected={value.includes(language)}
            onClick={() => onToggle(language)}
          />
        ))}
        {LAST_ROW_LANGUAGES.map((language) => (
          <OptionCard
            key={language}
            label={language}
            description=""
            selected={value.includes(language)}
            onClick={() => onToggle(language)}
          />
        ))}
        <OptionCard
          label="전체 선택"
          description=""
          selected={isAllSelected}
          onClick={onToggleAll}
          className="border-border/60 bg-muted/40 hover:border-border hover:bg-muted/70"
        />
      </div>
    </StepSection>
  )
}
