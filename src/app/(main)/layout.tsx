import type { ReactNode } from 'react'
import { MainHeader } from '@/components/layout/MainHeader'
import { QueryProvider } from '@/components/providers/QueryProvider'
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

  // DB 장애 시 레이아웃 전체가 터지는 것을 방지 — 에러를 Next.js 에러 바운더리로 위임
  let isDone: boolean
  try {
    isDone = await getOnboardingStatus(session.user.id)
  } catch {
    throw new Error('서비스에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
  }
  if (!isDone) redirect('/onboarding')

  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        <MainHeader image={session.user.image} name={session.user.name} />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </QueryProvider>
  )
}
