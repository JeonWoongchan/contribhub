import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { ok, err, ErrorCode } from '@/lib/api-response'
import { saveOnboardingSurvey } from '@/lib/user/onboarding'
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
  const session = await auth()
  if (!session) {
    return err('Unauthorized', 401, ErrorCode.UNAUTHORIZED)
  }

  try {
    const survey = (await req.json()) as OnboardingSurvey
    await saveOnboardingSurvey(session.user.id, survey)
    return ok({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return err('Failed to save onboarding', 500, ErrorCode.INTERNAL_ERROR)
  }
}
