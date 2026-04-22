import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import type { OnboardingSurvey } from '@/types/user'

/**
 * POST /api/onboarding
 *
 * 온보딩 설문 결과를 DB에 저장
 * 1. auth()로 세션 확인 (비로그인 차단)
 * 2. 요청 body에서 설문 결과 파싱
 * 3. user_profiles 테이블에 upsert
 *    - 신규: INSERT (users 테이블에서 github_id로 user_id 조회해서 삽입)
 *    - 재진입: ON CONFLICT로 기존 행 UPDATE (온보딩 재시도 허용)
 * 4. onboarding_done = true 로 설정 → 이후 layout.tsx 가드에서 대시보드로 통과
 */
export async function POST(req: NextRequest) {
  // 1. 세션 확인 — HttpOnly 쿠키 JWT 복호화 (네트워크 요청 없음)
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. 설문 결과 파싱
    const body: OnboardingSurvey = await req.json()
    const { experienceLevel, contributionTypes, topLanguages, weeklyHours, englishOk, purpose } = body

    // 3. user_profiles upsert
    //    - user_id: users 테이블에서 github_id(= session.user.id)로 조회
    //    - top_languages: 이 시점엔 빈 배열, /api/github/profile 호출 후 별도 업데이트
    //    - ON CONFLICT: 온보딩 재시도 시 덮어쓰기
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
                 ${topLanguages},
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
            top_languages      = EXCLUDED.top_languages,
            experience_level   = EXCLUDED.experience_level,
            contribution_types = EXCLUDED.contribution_types,
            weekly_hours       = EXCLUDED.weekly_hours,
            english_ok         = EXCLUDED.english_ok,
            purpose            = EXCLUDED.purpose,
            onboarding_done    = true,
            updated_at         = NOW()
    `

    // 4. 완료 응답 → 클라이언트에서 /dashboard 로 라우팅
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Failed to save onboarding' }, { status: 500 })
  }
}
