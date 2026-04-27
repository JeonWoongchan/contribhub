"use client"

import { useRouter } from 'next/navigation'
import { Bookmark, Menu, GitPullRequest, LogOut } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type UserMenuProps = {
    logoutAction: () => Promise<void>
}

export function UserMenu({ logoutAction }: UserMenuProps) {
    const router = useRouter()

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Menu className="size-5 shrink-0 opacity-60 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={12}>
                <DropdownMenuItem onSelect={() => router.push('/pr-history')}>
                    <GitPullRequest />
                    PR 히스토리
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/bookmarks')}>
                    <Bookmark />
                    북마크
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => logoutAction()}
                >
                    <LogOut />
                    로그아웃
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
