import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MyPageActivityCard } from './MyPageActivityCard'

function BlockSkeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />
}

function ProfileHeaderSkeleton() {
    return (
        <Card className="border border-border/70">
            <CardHeader className="gap-5 sm:grid-cols-[1fr_auto]">
                <div className="flex items-start gap-4">
                    <BlockSkeleton className="size-18 shrink-0 rounded-3xl" />
                    <div className="w-full space-y-3">
                        <div className="space-y-2">
                            <BlockSkeleton className="h-3 w-24" />
                            <BlockSkeleton className="h-7 w-40" />
                            <BlockSkeleton className="h-4 w-28" />
                        </div>
                        <div className="flex gap-2">
                            <BlockSkeleton className="h-5 w-24 rounded-full" />
                            <BlockSkeleton className="h-5 w-32 rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <BlockSkeleton className="h-8 w-24 rounded-md" />
                    <BlockSkeleton className="h-8 w-24 rounded-md" />
                </div>
            </CardHeader>
        </Card>
    )
}

function OnboardingCardSkeleton() {
    return (
        <Card className="border border-border/70">
            <CardHeader className="space-y-2">
                <BlockSkeleton className="h-5 w-24" />
                <BlockSkeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2 rounded-2xl border border-border/70 p-4">
                        <BlockSkeleton className="h-3 w-16" />
                        <BlockSkeleton className="h-5 w-32" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export function ProfileListSkeleton() {
    return (
        <div className="grid gap-6">
            <ProfileHeaderSkeleton />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]">
                <OnboardingCardSkeleton />
                <MyPageActivityCard />
            </div>
        </div>
    )
}
