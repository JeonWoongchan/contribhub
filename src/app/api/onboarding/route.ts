import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import type { OnboardingSurvey } from '@/types/user'

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body: OnboardingSurvey = await req.json()

        const { experienceLevel, contributionTypes, weeklyHours, englishOk, purpose } = body

        await sql`
          INSERT INTO user_profiles (
            user_id,
            top_languages,
            experience_level,
            contribution_types,
            weekly_hours,
            english_ok,
            purpose,
            onboarding_done,
            updated_at
          )
          VALUES (
            (SELECT id FROM users WHERE github_id = ${session.user.id}),
            ARRAY[]::text[],
            ${experienceLevel},
            ${contributionTypes},
            ${weeklyHours},
            ${englishOk},
            ${purpose},
            true,
            NOW()
          )
          ON CONFLICT (user_id)
          DO UPDATE SET
            experience_level = EXCLUDED.experience_level,
            contribution_types = EXCLUDED.contribution_types,
            weekly_hours = EXCLUDED.weekly_hours,
            english_ok = EXCLUDED.english_ok,
            purpose = EXCLUDED.purpose,
            onboarding_done = true,
            updated_at = NOW()
        `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Onboarding error:', error)
        return NextResponse.json({ error: 'Failed to save onboarding' }, { status: 500 })
    }
}