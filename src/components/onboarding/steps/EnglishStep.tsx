import { ENGLISH_OPTIONS } from '@/constants/contribution-levels'
import { OptionCard } from '@/components/onboarding/OptionCard'
import { StepSection } from '@/components/onboarding/StepSection'

type EnglishStepProps = {
  value: boolean
  onChange: (value: boolean) => void
}

export function EnglishStep({ value, onChange }: EnglishStepProps) {
  return (
    <StepSection title="영문 이슈와 문서도 괜찮나요?">
      {ENGLISH_OPTIONS.map((item) => (
        <OptionCard
          key={String(item.value)}
          label={item.label}
          description={item.description}
          selected={value === item.value}
          onClick={() => onChange(item.value)}
        />
      ))}
    </StepSection>
  )
}
