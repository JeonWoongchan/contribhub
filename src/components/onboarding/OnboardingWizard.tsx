'use client'

import { ONBOARDING_STEPS } from '@/constants/contribution-levels'
import { CenteredPanel } from '@/components/layout/CenteredPanel'
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard'
import { OnboardingWizardButton } from './OnboardingWizardButton'
import { StepProgress } from './StepProgress'
import { ContributionTypesStep } from './steps/ContributionTypesStep'
import { ExperienceStep } from './steps/ExperienceStep'
import { LanguagesStep } from './steps/LanguagesStep'
import { PurposeStep } from './steps/PurposeStep'
import { WeeklyHoursStep } from './steps/WeeklyHoursStep'

export default function OnboardingWizard({ initialLanguages }: { initialLanguages: string[] }) {
  const {
    canNext,
    form,
    goNext,
    goPrev,
    handleSubmit,
    loading,
    step,
    toggleAllTopLanguages,
    toggleContributionType,
    toggleTopLanguage,
    updateExperienceLevel,
    updatePurpose,
    updateWeeklyHours,
  } = useOnboardingWizard(initialLanguages)

  const isLastStep = step === ONBOARDING_STEPS.length - 1
  const canGoPrev = step > 0

  function renderCurrentStep() {
    const currentStep = ONBOARDING_STEPS[step]

    if (!currentStep) {
      return null
    }

    switch (currentStep.id) {
      case 'experienceLevel':
        return <ExperienceStep value={form.experienceLevel} onChange={updateExperienceLevel} />
      case 'contributionTypes':
        return (
          <ContributionTypesStep
            value={form.contributionTypes}
            onToggle={toggleContributionType}
          />
        )
      case 'topLanguages':
        return (
          <LanguagesStep
            value={form.topLanguages}
            onToggle={toggleTopLanguage}
            onToggleAll={toggleAllTopLanguages}
          />
        )
      case 'weeklyHours':
        return <WeeklyHoursStep value={form.weeklyHours} onChange={updateWeeklyHours} />
      case 'purpose':
        return <PurposeStep value={form.purpose} onChange={updatePurpose} />
      default:
        return null
    }
  }

  return (
    <CenteredPanel>
      <div className="mb-6 space-y-2">
        <p className="text-sm font-medium text-interactive-action-hover">추천 설정</p>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          나에게 맞는 이슈를 찾기 위해 몇 가지만 알려주세요
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          답변을 매칭 점수로 계산해 잘 맞는 이슈부터 보여드릴게요.
        </p>
      </div>
      <StepProgress currentStep={step} labels={ONBOARDING_STEPS.map((item) => item.label)} />
      {renderCurrentStep()}
      <div className="mt-6 flex gap-3">
        {canGoPrev ? (
          <OnboardingWizardButton tone="secondary" onClick={goPrev}>
            이전
          </OnboardingWizardButton>
        ) : null}
        {isLastStep ? (
          <OnboardingWizardButton disabled={!canNext || loading} onClick={handleSubmit}>
            {loading ? '저장 중...' : '시작하기'}
          </OnboardingWizardButton>
        ) : (
          <OnboardingWizardButton disabled={!canNext} onClick={goNext}>
            다음
          </OnboardingWizardButton>
        )}
      </div>
    </CenteredPanel>
  )
}
