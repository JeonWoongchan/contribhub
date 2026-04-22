'use client'

import {ONBOARDING_STEPS} from '@/constants/contribution-levels'
import {CenteredPanel} from '@/components/layout/CenteredPanel'
import {OnboardingWizardButton} from '@/components/onboarding/OnboardingWizardButton'
import {StepProgress} from '@/components/onboarding/StepProgress'
import {ContributionTypesStep} from '@/components/onboarding/steps/ContributionTypesStep'
import {EnglishStep} from '@/components/onboarding/steps/EnglishStep'
import {ExperienceStep} from '@/components/onboarding/steps/ExperienceStep'
import {LanguagesStep} from '@/components/onboarding/steps/LanguagesStep'
import {PurposeStep} from '@/components/onboarding/steps/PurposeStep'
import {WeeklyHoursStep} from '@/components/onboarding/steps/WeeklyHoursStep'
import {useOnboardingWizard} from '@/hooks/useOnboardingWizard'

export default function OnboardingWizard({ initialLanguages }: { initialLanguages: string[] }) {
  const {
    canNext,
    form,
    goNext,
    goPrev,
    handleSubmit,
    loading,
    step,
    toggleContributionType,
    toggleTopLanguage,
    updateEnglishOk,
    updateExperienceLevel,
    updatePurpose,
    updateWeeklyHours,
  } = useOnboardingWizard(initialLanguages)

  // 파생 상태 — UI 분기 조건
  const isLastStep = step === ONBOARDING_STEPS.length - 1
  const canGoPrev = step > 0

  // 현재 단계 ID 기준으로 렌더링할 컴포넌트 반환
  // switch 사용 — ONBOARDING_STEPS에 단계 추가 시 누락 방지
  function renderCurrentStep() {
    const currentStep = ONBOARDING_STEPS[step]
    if (!currentStep) return null

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
        return <LanguagesStep value={form.topLanguages} onToggle={toggleTopLanguage} />
      case 'weeklyHours':
        return <WeeklyHoursStep value={form.weeklyHours} onChange={updateWeeklyHours} />
      case 'englishOk':
        return <EnglishStep value={form.englishOk} onChange={updateEnglishOk} />
      case 'purpose':
        return <PurposeStep value={form.purpose} onChange={updatePurpose} />
      default: {
        return currentStep.id
      }
    }
  }

  return (
    <CenteredPanel>
      <StepProgress currentStep={step} labels={ONBOARDING_STEPS.map((item) => item.label)} />
      {renderCurrentStep()}
      <div className="mt-6 flex gap-3">
        {canGoPrev && (
          <OnboardingWizardButton tone="secondary" onClick={goPrev}>
            이전
          </OnboardingWizardButton>
        )}
        {isLastStep ? (
          <OnboardingWizardButton disabled={!canNext || loading} onClick={handleSubmit}>
            {loading ? '저장 중...' : '시작하기 🚀'}
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
