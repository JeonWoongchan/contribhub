'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    EXPERIENCE_LEVELS,
    CONTRIBUTION_TYPES,
    PURPOSES,
    WEEKLY_HOURS,
} from '@/constants/contribution-levels'
import type { ExperienceLevel, ContributionType, Purpose, WeeklyHours } from '@/types/user'

type FormState = {
    experienceLevel: ExperienceLevel | null
    contributionTypes: ContributionType[]
    weeklyHours: WeeklyHours | null
    englishOk: boolean
    purpose: Purpose | null
}

const STEPS = ['경험 수준', '기여 방식', '주당 시간', '언어', '목적'] as const

export default function OnboardingWizard() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState<FormState>({
        experienceLevel: null,
        contributionTypes: [],
        weeklyHours: null,
        englishOk: false,
        purpose: null,
    })

    const canNext = () => {
        if (step === 0) return !!form.experienceLevel
        if (step === 1) return form.contributionTypes.length > 0
        if (step === 2) return !!form.weeklyHours
        if (step === 3) return true
        if (step === 4) return !!form.purpose
        return false
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            router.push('/dashboard')
        } catch {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                {/* 스텝 인디케이터 */}
                <div className="flex items-center gap-2 mb-8">
                    {STEPS.map((label, i) => (
                        <div key={label} className="flex items-center gap-2 flex-1">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                                    i < step
                                        ? 'bg-indigo-600 text-white'
                                        : i === step
                                            ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400'
                                            : 'bg-gray-100 text-gray-400'
                                }`}
                            >
                                {i < step ? '✓' : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 ${i < step ? 'bg-indigo-400' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 0: 경험 수준 */}
                {step === 0 && (
                    <StepSection title="오픈소스 기여 경험이 어느 정도인가요?">
                        {EXPERIENCE_LEVELS.map((item) => (
                            <OptionCard
                                key={item.value}
                                label={item.label}
                                description={item.description}
                                selected={form.experienceLevel === item.value}
                                onClick={() => setForm((f) => ({ ...f, experienceLevel: item.value }))}
                            />
                        ))}
                    </StepSection>
                )}

                {/* Step 1: 기여 방식 (멀티셀렉트) */}
                {step === 1 && (
                    <StepSection title="어떤 방식으로 기여하고 싶나요? (복수 선택)">
                        {CONTRIBUTION_TYPES.map((item) => (
                            <OptionCard
                                key={item.value}
                                label={item.label}
                                description={item.description}
                                selected={form.contributionTypes.includes(item.value)}
                                onClick={() =>
                                    setForm((f) => ({
                                        ...f,
                                        contributionTypes: f.contributionTypes.includes(item.value)
                                            ? f.contributionTypes.filter((v) => v !== item.value)
                                            : [...f.contributionTypes, item.value],
                                    }))
                                }
                            />
                        ))}
                    </StepSection>
                )}

                {/* Step 2: 주당 시간 */}
                {step === 2 && (
                    <StepSection title="주당 얼마나 시간을 쓸 수 있나요?">
                        {WEEKLY_HOURS.map((item) => (
                            <OptionCard
                                key={item.value}
                                label={item.label}
                                description={item.description}
                                selected={form.weeklyHours === item.value}
                                onClick={() => setForm((f) => ({ ...f, weeklyHours: item.value }))}
                            />
                        ))}
                    </StepSection>
                )}

                {/* Step 3: 영어 이슈 가능 여부 */}
                {step === 3 && (
                    <StepSection title="영어로 된 이슈도 괜찮나요?">
                        <OptionCard
                            label="네, 괜찮아요"
                            description="영어 이슈도 추천받을게요"
                            selected={form.englishOk === true}
                            onClick={() => setForm((f) => ({ ...f, englishOk: true }))}
                        />
                        <OptionCard
                            label="한국어만 볼게요"
                            description="한국어 이슈 위주로 추천"
                            selected={form.englishOk === false}
                            onClick={() => setForm((f) => ({ ...f, englishOk: false }))}
                        />
                    </StepSection>
                )}

                {/* Step 4: 목적 */}
                {step === 4 && (
                    <StepSection title="기여 목적이 무엇인가요?">
                        {PURPOSES.map((item) => (
                            <OptionCard
                                key={item.value}
                                label={item.label}
                                description={item.description}
                                selected={form.purpose === item.value}
                                onClick={() => setForm((f) => ({ ...f, purpose: item.value }))}
                            />
                        ))}
                    </StepSection>
                )}

                {/* 버튼 */}
                <div className="flex gap-3 mt-6">
                    {step > 0 && (
                        <button
                            onClick={() => setStep((s) => s - 1)}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            이전
                        </button>
                    )}
                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={() => setStep((s) => s + 1)}
                            disabled={!canNext()}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            다음
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canNext() || loading}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '저장 중...' : '시작하기 🚀'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function StepSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
            <div className="flex flex-col gap-2">{children}</div>
        </div>
    )
}

function OptionCard({
    label,
    description,
    selected,
    onClick,
}: {
    label: string
    description: string
    selected: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selected
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
        >
            <div className="text-sm font-medium text-gray-900">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{description}</div>
        </button>
    )
}