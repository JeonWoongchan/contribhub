"use client"

import Link from 'next/link'
import { Bookmark, LogOut, Menu, GitPullRequest, UserRound } from 'lucide-react'
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
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Menu className="size-5 shrink-0 cursor-pointer opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={12}>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound />
            마이페이지
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pr-history">
            <GitPullRequest />
            PR 히스토리
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/bookmarks">
            <Bookmark />
            북마크
          </Link>
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
