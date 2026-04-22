import { Button } from '@/components/ui/button'
import { auth, signOut } from '@/lib/auth'
import sql from '@/lib/db'
import Image from 'next/image'
import { redirect } from 'next/navigation'

async function getOnboardingStatus(githubId: string): Promise<boolean> {
  const rows = await sql`
    SELECT up.onboarding_done
    FROM user_profiles up
    JOIN users u ON u.id = up.user_id
    WHERE u.github_id = ${githubId}
      AND up.onboarding_done = true
    LIMIT 1
  `

  return rows.length > 0
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const isDone = await getOnboardingStatus(session.user.id)
  if (!isDone) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">ContribHub</span>
          <div className="flex items-center gap-3">
            {session.user.image && (
              <div className="overflow-hidden rounded-full ring-1 ring-interactive-selected-border">
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'avatar'}
                  width={28}
                  height={28}
                  className="h-7 w-7 bg-interactive-selected object-cover"
                />
              </div>
            )}
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="text-xs text-muted-foreground hover:bg-interactive-hover hover:text-interactive-action-hover"
              >
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
