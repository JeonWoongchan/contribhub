import { PURPOSES } from '@/constants/contribution-levels'
import { OptionCard } from '@/components/onboarding/OptionCard'
import { StepSection } from '@/components/onboarding/StepSection'
import type { Purpose } from '@/types/user'

type PurposeStepProps = {
  value: Purpose | null
  onChange: (value: Purpose) => void
}

export function PurposeStep({ value, onChange }: PurposeStepProps) {
  return (
    <StepSection
      title="이번 기여를 통해 가장 얻고 싶은 건 무엇인가요?"
      description="참여 목적에 맞춰 포트폴리오용인지, 성장용인지 더 잘 맞는 이슈를 보여드릴게요."
    >
      {PURPOSES.map((item) => (
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
