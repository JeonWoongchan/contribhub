import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { isStepComplete, ONBOARDING_STEPS } from '@/constants/contribution-levels'
import type { FormState } from '@/types/onboarding'
import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'

const INITIAL_FORM_STATE: FormState = {
  experienceLevel: null,
  contributionTypes: [],
  weeklyHours: null,
  englishOk: false,
  purpose: null,
}

export function useOnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE)

  // 현재 step 기준 다음 단계 이동 가능 여부 계산
  const canNext = isStepComplete(step, form)

  function goNext() {
    // 다음 step으로 이동
    setStep((currentStep) => Math.min(currentStep + 1, ONBOARDING_STEPS.length - 1))
  }

  function goPrev() {
    // 이전 step으로 이동
    setStep((currentStep) => Math.max(currentStep - 1, 0))
  }

  function updateExperienceLevel(value: ExperienceLevel) {
    // 경험 수준 응답 업데이트
    setForm((currentForm) => ({ ...currentForm, experienceLevel: value }))
  }

  function toggleContributionType(value: ContributionType) {
    // 기여 방식 다중 선택 토글
    setForm((currentForm) => ({
      ...currentForm,
      contributionTypes: currentForm.contributionTypes.includes(value)
        ? currentForm.contributionTypes.filter((item) => item !== value)
        : [...currentForm.contributionTypes, value],
    }))
  }

  function updateWeeklyHours(value: WeeklyHours) {
    // 주간 투입 시간 응답 업데이트
    setForm((currentForm) => ({ ...currentForm, weeklyHours: value }))
  }

  function updateEnglishOk(value: boolean) {
    // 영어 이슈 허용 여부 업데이트
    setForm((currentForm) => ({ ...currentForm, englishOk: value }))
  }

  function updatePurpose(value: Purpose) {
    // 참여 목적 응답 업데이트
    setForm((currentForm) => ({ ...currentForm, purpose: value }))
  }

  async function handleSubmit() {
    // 제출 중 상태 전환
    setLoading(true)

    try {
      // 온보딩 응답 저장 요청
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        setLoading(false)
        return
      }

      // 저장 성공 후 대시보드 이동
      router.push('/dashboard')
    } catch {
      // 제출 실패 시 로딩 상태 해제
      setLoading(false)
    }
  }

  return {
    canNext,
    form,
    goNext,
    goPrev,
    handleSubmit,
    loading,
    step,
    updateEnglishOk,
    updateExperienceLevel,
    updatePurpose,
    updateWeeklyHours,
    toggleContributionType,
  }
}
