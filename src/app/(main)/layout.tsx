import type { ReactNode } from 'react'
import { MainHeader } from '@/components/layout/MainHeader'
import { auth } from '@/lib/auth'
import { getOnboardingStatus } from '@/lib/user/profile'
import { redirect } from 'next/navigation'

export default async function MainLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const isDone = await getOnboardingStatus(session.user.id)
  if (!isDone) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-background">
      <MainHeader image={session.user.image} name={session.user.name} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
