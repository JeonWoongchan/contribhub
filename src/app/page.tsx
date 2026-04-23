import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOnboardingStatus } from '@/lib/user/profile'

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const isOnboardingDone = await getOnboardingStatus(session.user.id)

  redirect(isOnboardingDone ? '/dashboard' : '/onboarding')
}
