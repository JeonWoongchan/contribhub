'use client'

import { useMyPageData } from '@/hooks/useMyPageData'
import { CardListError } from '@/components/shared/CardListError'
import { MyPageActivityCard } from './MyPageActivityCard'
import { MyPageOnboardingCard } from './MyPageOnboardingCard'
import { MyPageProfileHeader } from './MyPageProfileHeader'
import { ProfileListSkeleton } from './ProfileListSkeleton'

export function ProfileList() {
    const { data, isPending, isError, errorMessage, refetch } = useMyPageData()

    if (isPending) return <ProfileListSkeleton />
    if (isError) return <CardListError message={errorMessage} onRetry={refetch} />
    if (!data) return null

    return (
        <div className="grid gap-6">
            <MyPageProfileHeader data={data} />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]">
                <MyPageOnboardingCard onboarding={data.onboarding} />

                <MyPageActivityCard />
            </div>
        </div>
    )
}
