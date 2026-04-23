import { EXPERIENCE_LEVELS } from '@/constants/contribution-levels'
import { OptionCard } from '@/components/onboarding/OptionCard'
import { StepSection } from '@/components/onboarding/StepSection'
import type { ExperienceLevel } from '@/types/user'

type ExperienceStepProps = {
  value: ExperienceLevel | null
  onChange: (value: ExperienceLevel) => void
}

export function ExperienceStep({ value, onChange }: ExperienceStepProps) {
  return (
    <StepSection
      title="오픈소스 기여 경험은 어느 정도인가요?"
      description="현재 익숙한 수준에 맞춰 너무 어렵지 않은 이슈를 추천해드릴게요."
    >
      {EXPERIENCE_LEVELS.map((item) => (
        <OptionCard
          key={item.value}
          label={item.label}
          description={item.description}
          selected={value === item.value}
          onClick={() => onChange(item.value)}
        />
      ))}
    </StepSection>
  )
}
