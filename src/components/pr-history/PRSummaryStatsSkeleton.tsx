import { Card, CardContent } from '@/components/ui/card'

const SKELETON_INDICES = [0, 1, 2, 3] as const

export function PRSummaryStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SKELETON_INDICES.map((i) => (
                <Card key={i} size="sm" className="border border-border py-3">
                    <CardContent className="flex animate-pulse flex-col items-center gap-1 text-center">
                        <div className="h-3 w-14 rounded bg-muted" />
                        <div className="h-[1.75rem] w-10 rounded bg-muted" />
                        <div className="h-3 w-8 rounded bg-muted" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
