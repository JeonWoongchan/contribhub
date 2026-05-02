import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { isStepComplete, ONBOARDING_STEPS, POPULAR_LANGUAGES } from '@/constants/contribution-levels'
import type { FormState } from '@/types/onboarding'
import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'
import type { ApiResponse } from '@/types/api'

const DEFAULT_ERROR_MESSAGE = '온보딩 저장에 실패했습니다.'

export function useOnboardingWizard(initialLanguages: string[] = []) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>({
    experienceLevel: null,
    contributionTypes: [],
    topLanguages: initialLanguages,
    weeklyHours: null,
    purpose: null,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = (await res.json()) as ApiResponse<{ success: boolean }>
      if (!json.ok) throw new Error(json.error?.message ?? DEFAULT_ERROR_MESSAGE)
    },
    onSuccess: () => {
      router.push('/dashboard')
    },
  })

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
    handleSubmit: () => { mutation.mutate() },
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.isError ? mutation.error.message : DEFAULT_ERROR_MESSAGE,
    step,
    toggleAllTopLanguages,
    toggleContributionType,
    toggleTopLanguage,
    updateExperienceLevel,
    updatePurpose,
    updateWeeklyHours,
  }
}
