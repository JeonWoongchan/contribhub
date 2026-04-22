import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'
import { getTopLanguagesFromGitHub } from '@/lib/github/profile'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const initialLanguages = await getTopLanguagesFromGitHub()

  return <OnboardingWizard initialLanguages={initialLanguages} />
}
