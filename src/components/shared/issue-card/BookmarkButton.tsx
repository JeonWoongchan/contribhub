'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { IssueCardItem } from '@/types/issue'

type BookmarkButtonProps = {
    issue: IssueCardItem
    isBookmarkPending: boolean
    onToggleBookmarkAction: (issue: IssueCardItem) => Promise<void>
}

export function BookmarkButton({ issue, isBookmarkPending, onToggleBookmarkAction }: BookmarkButtonProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    function handleClick() {
        if (issue.isBookmarked) {
            setIsConfirmOpen(true)
        } else {
            void onToggleBookmarkAction(issue)
        }
    }

    function handleConfirm() {
        void onToggleBookmarkAction(issue)
    }

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={isBookmarkPending}
                aria-label={issue.isBookmarked ? '북마크 제거' : '북마크 추가'}
                aria-pressed={issue.isBookmarked ?? false}
                className={cn(
                    'text-muted-foreground hover:bg-interactive-hover hover:text-bookmark-action-hover',
                    issue.isBookmarked ? 'text-bookmark-action' : null
                )}
                onClick={handleClick}
            >
                <Bookmark className={cn('size-5 transition-colors', issue.isBookmarked ? 'fill-current' : null)} />
            </Button>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>북마크를 제거할까요?</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 이슈를 북마크 목록에서 제거합니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>제거</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
