import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const result = await sql`
    SELECT onboarding_done
    FROM user_profiles
    WHERE user_id = (
      SELECT id FROM users WHERE github_id = ${session.user.id}
    )
  `

  const onboardingDone = result[0]?.onboarding_done ?? false

  if (!onboardingDone) {
    redirect('/onboarding')
  }

  return <>{children}</>
}
