import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import { getTopLanguagesFromGitHub } from '@/lib/github/profile'
import { createNoIndexMetadata } from '@/lib/metadata'

export const metadata: Metadata = createNoIndexMetadata({
  title: '온보딩',
  description: 'Open Issue Map 추천 기준을 설정합니다.',
})

export default async function OnboardingPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const initialLanguages = await getTopLanguagesFromGitHub()

  return <OnboardingWizard initialLanguages={initialLanguages} />
}
