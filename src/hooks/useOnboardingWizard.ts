import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { isStepComplete, ONBOARDING_STEPS } from '@/constants/contribution-levels'
import type { FormState } from '@/types/onboarding'
import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'

export function useOnboardingWizard(initialLanguages: string[] = []) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>({
    experienceLevel: null,
    contributionTypes: [],
    topLanguages: initialLanguages,
    weeklyHours: null,
    englishOk: false,
    purpose: null,
  })

  // 현재 단계 완료 여부 — 다음 버튼 활성화 조건
  const canNext = isStepComplete(step, form)

  // 다음 단계로 이동 (마지막 단계 초과 방지)
  function goNext() {
    setStep((s) => Math.min(s + 1, ONBOARDING_STEPS.length - 1))
  }

  // 이전 단계로 이동 (첫 단계 미만 방지)
  function goPrev() {
    setStep((s) => Math.max(s - 1, 0))
  }

  // 경험 수준 선택 업데이트
  function updateExperienceLevel(value: ExperienceLevel) {
    setForm((f) => ({ ...f, experienceLevel: value }))
  }

  // 기여 방식 다중 선택 토글 (선택 → 해제, 해제 → 선택)
  function toggleContributionType(value: ContributionType) {
    setForm((f) => ({
      ...f,
      contributionTypes: f.contributionTypes.includes(value)
        ? f.contributionTypes.filter((i) => i !== value)
        : [...f.contributionTypes, value],
    }))
  }

  // 선호 언어 토글 (선택 → 해제, 해제 → 선택)
  function toggleTopLanguage(lang: string) {
    setForm((f) => ({
      ...f,
      topLanguages: f.topLanguages.includes(lang)
        ? f.topLanguages.filter((l) => l !== lang)
        : [...f.topLanguages, lang],
    }))
  }

  // 주간 투입 시간 선택 업데이트
  function updateWeeklyHours(value: WeeklyHours) {
    setForm((f) => ({ ...f, weeklyHours: value }))
  }

  // 영어 이슈 허용 여부 업데이트
  function updateEnglishOk(value: boolean) {
    setForm((f) => ({ ...f, englishOk: value }))
  }

  // 참여 목적 선택 업데이트
  function updatePurpose(value: Purpose) {
    setForm((f) => ({ ...f, purpose: value }))
  }

  // 설문 최종 제출 — API 저장 후 대시보드로 이동
  async function handleSubmit() {
    setLoading(true)
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) return

      router.push('/dashboard')
    } catch {
      // 제출 실패 시 로딩 해제 — 유저가 재시도 가능
    } finally {
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
    toggleContributionType,
    toggleTopLanguage,
    updateEnglishOk,
    updateExperienceLevel,
    updatePurpose,
    updateWeeklyHours,
  }
}
