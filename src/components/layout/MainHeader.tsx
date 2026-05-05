import Link from 'next/link'
import { signOut } from '@/lib/auth'
import { UserAvatar } from './UserAvatar'
import { UserMenu } from './UserMenu'

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
        <header
            data-scroll-lock-offset
            className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md"
        >
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                <Link
                    href="/dashboard"
                    className="text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-interactive-action-hover"
                >
                    Open Issue Map
                </Link>
                <div className="flex items-center gap-3">
                    <UserAvatar image={image} name={name} />
                    <UserMenu logoutAction={logoutAction} />
                </div>
            </div>
        </header>
    )
}
