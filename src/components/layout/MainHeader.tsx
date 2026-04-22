import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'

type MainHeaderProps = {
  image: string | null | undefined
  name: string | null | undefined
}

async function logoutAction() {
  'use server'
  await signOut({ redirectTo: '/login' })
}

export function MainHeader({ image, name }: MainHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-interactive-action-hover"
        >
          ContribHub
        </Link>
        <div className="flex items-center gap-3">
          {image && (
            <div className="overflow-hidden rounded-full ring-1 ring-interactive-selected-border">
              <Image
                src={image}
                alt={name ?? 'avatar'}
                width={28}
                height={28}
                className="h-7 w-7 bg-interactive-selected object-cover"
              />
            </div>
          )}
          <span className="text-sm text-muted-foreground">{name ?? '사용자'}</span>
          <form action={logoutAction}>
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
  )
}
