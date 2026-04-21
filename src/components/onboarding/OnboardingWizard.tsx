'use client'

import { ONBOARDING_STEPS } from '@/constants/contribution-levels'
import { CenteredPanel } from '@/components/layout/CenteredPanel'
import { OnboardingWizardButton } from '@/components/onboarding/OnboardingWizardButton'
import { StepProgress } from '@/components/onboarding/StepProgress'
import { ContributionTypesStep } from '@/components/onboarding/steps/ContributionTypesStep'
import { EnglishStep } from '@/components/onboarding/steps/EnglishStep'
import { ExperienceStep } from '@/components/onboarding/steps/ExperienceStep'
import { PurposeStep } from '@/components/onboarding/steps/PurposeStep'
import { WeeklyHoursStep } from '@/components/onboarding/steps/WeeklyHoursStep'
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard'

export default function OnboardingWizard() {
  const {
    canNext,
    form,
    goNext,
    goPrev,
    handleSubmit,
    loading,
    step,
    toggleContributionType,
    updateEnglishOk,
    updateExperienceLevel,
    updatePurpose,
    updateWeeklyHours,
  } = useOnboardingWizard()

  function renderCurrentStep() {
    // step index와 실제 화면 컴포넌트 매핑
    // 부모 컨테이너의 상태 관리와 흐름 제어 담당
    const currentStep = ONBOARDING_STEPS[step]
    const stepRenderers = {
      experienceLevel: () => <ExperienceStep value={form.experienceLevel} onChange={updateExperienceLevel} />,
      contributionTypes: () => (
        <ContributionTypesStep value={form.contributionTypes} onToggle={toggleContributionType} />
      ),
      weeklyHours: () => <WeeklyHoursStep value={form.weeklyHours} onChange={updateWeeklyHours} />,
      englishOk: () => <EnglishStep value={form.englishOk} onChange={updateEnglishOk} />,
      purpose: () => <PurposeStep value={form.purpose} onChange={updatePurpose} />,
    }

    if (!currentStep) {
      return null
    }

    return stepRenderers[currentStep.id]()
  }

  return (
    <CenteredPanel>
      <StepProgress currentStep={step} labels={ONBOARDING_STEPS.map((item) => item.label)} />

      {renderCurrentStep()}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <OnboardingWizardButton tone="secondary" onClick={goPrev}>
            이전
          </OnboardingWizardButton>
        )}
        {step < ONBOARDING_STEPS.length - 1 ? (
          <OnboardingWizardButton disabled={!canNext} onClick={goNext}>
            다음
          </OnboardingWizardButton>
        ) : (
          <OnboardingWizardButton disabled={!canNext || loading} onClick={handleSubmit}>
            {loading ? '저장 중...' : '시작하기 🚀'}
          </OnboardingWizardButton>
        )}
      </div>
    </CenteredPanel>
  )
}
