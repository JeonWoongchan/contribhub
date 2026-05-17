import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { isStepComplete, ONBOARDING_STEPS, POPULAR_LANGUAGES } from '@/constants/contribution-levels'
import { isUnauthorizedApiResponse, redirectToLogin } from '@/lib/client-auth'
import type { FormState } from '@/types/onboarding'
import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'
import type { ApiResponse } from '@/types/api'

const DEFAULT_ERROR_MESSAGE = '온보딩 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'

export function useOnboardingWizard(initialLanguages: string[] = []) {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>({
    experienceLevel: null,
    contributionTypes: [],
    topLanguages: initialLanguages.filter((lang) => (POPULAR_LANGUAGES as readonly string[]).includes(lang)),
    weeklyHours: null,
    purpose: null,
  })
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit() {
    setIsPending(true)
    setErrorMessage(null)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = (await res.json()) as ApiResponse<{ success: boolean }>
      if (isUnauthorizedApiResponse(res, json)) {
        redirectToLogin()
        return
      }
      if (!json.ok) {
        setErrorMessage(DEFAULT_ERROR_MESSAGE)
        return
      }
      // 온보딩 완료를 JWT에 반영 — 이후 미들웨어·레이아웃이 DB 조회 없이 통과
      await update({ isOnboarded: true })
      router.push('/dashboard')
    } catch {
      setErrorMessage(DEFAULT_ERROR_MESSAGE)
    } finally {
      setIsPending(false)
    }
  }

  const canNext = isStepComplete(step, form)

  function goNext() {
    setStep((currentStep) => Math.min(currentStep + 1, ONBOARDING_STEPS.length - 1))
  }

  function goPrev() {
    setStep((currentStep) => Math.max(currentStep - 1, 0))
  }

  function updateExperienceLevel(value: ExperienceLevel) {
    setForm((currentForm) => ({ ...currentForm, experienceLevel: value }))
  }

  function toggleContributionType(value: ContributionType) {
    setForm((currentForm) => ({
      ...currentForm,
      contributionTypes: currentForm.contributionTypes.includes(value)
        ? currentForm.contributionTypes.filter((item) => item !== value)
        : [...currentForm.contributionTypes, value],
    }))
  }

  function toggleTopLanguage(language: string) {
    setForm((currentForm) => ({
      ...currentForm,
      topLanguages: currentForm.topLanguages.includes(language)
        ? currentForm.topLanguages.filter((item) => item !== language)
        : [...currentForm.topLanguages, language],
    }))
  }

  function toggleAllTopLanguages() {
    setForm((currentForm) => ({
      ...currentForm,
      topLanguages:
        currentForm.topLanguages.length === POPULAR_LANGUAGES.length ? [] : [...POPULAR_LANGUAGES],
    }))
  }

  function updateWeeklyHours(value: WeeklyHours) {
    setForm((currentForm) => ({ ...currentForm, weeklyHours: value }))
  }

  function updatePurpose(value: Purpose) {
    setForm((currentForm) => ({ ...currentForm, purpose: value }))
  }

  return {
    canNext,
    form,
    goNext,
    goPrev,
    handleSubmit,
    isPending,
    isError: errorMessage !== null,
    errorMessage,
    step,
    toggleAllTopLanguages,
    toggleContributionType,
    toggleTopLanguage,
    updateExperienceLevel,
    updatePurpose,
    updateWeeklyHours,
  }
}
