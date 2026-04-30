'use client'

import { Bookmark, GitPullRequest } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMyPageActivity } from '@/hooks/useMyPageActivity'
import { CardListError } from '@/components/shared/CardListError'
import { MyPageStatCard } from './MyPageStatCard'

function ActivitySkeleton() {
    return (
        <Card className="border border-border/70 bg-card/95">
            <CardHeader className="space-y-2">
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="grid gap-3">
                {[0, 1].map((i) => (
                    <Card key={i} size="sm" className="border border-border/70">
                        <CardContent className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 animate-pulse rounded-2xl bg-muted" />
                                <div className="space-y-2">
                                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                                    <div className="h-7 w-12 animate-pulse rounded bg-muted" />
                                </div>
                            </div>
                            <div className="h-7 w-12 animate-pulse rounded-md bg-muted" />
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    )
}

export function MyPageActivityCard() {
    const { data, isPending, isError, errorMessage, refetch } = useMyPageActivity()

    if (isPending) return <ActivitySkeleton />
    if (isError) return <CardListError message={errorMessage} onRetry={refetch} />
    if (!data) return null

    return (
        <Card className="border border-border/70 bg-card/95">
            <CardHeader>
                <CardTitle>내 활동 요약</CardTitle>
                <CardDescription>저장한 이슈와 GitHub 활동 이력을 빠르게 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                <MyPageStatCard
                    icon={<Bookmark className="size-4" />}
                    label="Bookmarks"
                    value={`${data.bookmarkCount}개`}
                    href="/bookmarks"
                />
                <MyPageStatCard
                    icon={<GitPullRequest className="size-4" />}
                    label="Pull Requests"
                    value={`${data.pullRequestCount}개`}
                    href="/pr-history"
                />
            </CardContent>
        </Card>
    )
}
