import { CONTRIBUTION_TYPES } from '@/constants/contribution-levels'
import { OptionCard } from '@/components/onboarding/OptionCard'
import { StepSection } from '@/components/onboarding/StepSection'
import type { ContributionType } from '@/types/user'

type ContributionTypesStepProps = {
  value: ContributionType[]
  onToggle: (value: ContributionType) => void
}

export function ContributionTypesStep({ value, onToggle }: ContributionTypesStepProps) {
  return (
    <StepSection
      title="어떤 방식으로 기여하고 싶나요?"
      description="관심 있는 작업 형태를 기준으로 더 잘 맞는 이슈를 골라드릴게요."
    >
      {CONTRIBUTION_TYPES.map((item) => (
        <OptionCard
          key={item.value}
          label={item.label}
          description={item.description}
          selected={value.includes(item.value)}
          onClick={() => onToggle(item.value)}
        />
      ))}
    </StepSection>
  )
}
