import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signInWithGitHub, signOutToHome } from '@/lib/auth-actions'
import { UserAvatar } from './UserAvatar'
import { UserMenu } from './UserMenu'

type MainHeaderProps = {
    image: string | null | undefined
    name: string | null | undefined
    isGuest?: boolean
}

export function MainHeader({ image, name, isGuest = false }: MainHeaderProps) {
    return (
        <header
            data-scroll-lock-offset
            className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md"
        >
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                <Link
                    href="/dashboard"
                    className="text-sm font-semibold tracking-tight text-interactive-action transition-colors hover:text-bookmark-action"
                >
                    Open Issue Map
                </Link>
                <div className="flex items-center gap-3">
                    {isGuest ? (
                        <form action={signInWithGitHub}>
                            <Button type="submit" size="sm">로그인</Button>
                        </form>
                    ) : (
                        <>
                            <UserAvatar image={image} name={name} />
                            <UserMenu logoutAction={signOutToHome} />
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
