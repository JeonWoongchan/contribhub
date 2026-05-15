import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { MainHeader } from '@/components/layout/MainHeader'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function MainLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  // isOnboarded는 JWT에 저장된 값 — DB 조회 없이 확인
  if (!session.user.isOnboarded) redirect('/onboarding')

  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        <MainHeader image={session.user.image} name={session.user.name} />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </QueryProvider>
  )
}
