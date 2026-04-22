import { OptionCard } from '@/components/onboarding/OptionCard'
import { StepSection } from '@/components/onboarding/StepSection'
import {POPULAR_LANGUAGES} from "@/constants/contribution-levels";

type LanguagesStepProps = {
  value: string[]
  onToggle: (lang: string) => void
}

export function LanguagesStep({ value, onToggle }: LanguagesStepProps) {
  return (
    <StepSection title="어떤 언어로 기여하고 싶나요?">
      {POPULAR_LANGUAGES.map((lang) => (
        <OptionCard
          key={lang}
          label={lang}
          description=""
          selected={value.includes(lang)}
          onClick={() => onToggle(lang)}
        />
      ))}
    </StepSection>
  )
}
