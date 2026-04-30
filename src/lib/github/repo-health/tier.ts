import { HEALTH_SCORE_TIERS } from '@/constants/scoring-rules'
import type { HealthTier } from '@/lib/github/issues/badge-meta'

// 레포 활성도 점수를 표시용 등급으로 변환하는 함수.
export function getHealthTier(score: number): HealthTier {
  if (score >= HEALTH_SCORE_TIERS.HIGH) {
    return { label: '활성도 높음', variant: 'success', isAnimated: true }
  }

  if (score >= HEALTH_SCORE_TIERS.MID) {
    return { label: '활성도 보통', variant: 'warning', isAnimated: false }
  }

  if (score >= HEALTH_SCORE_TIERS.LOW) {
    return { label: '활성도 낮음', variant: 'warning', isAnimated: false }
  }

  return { label: '활성도 매우 낮음', variant: 'danger', isAnimated: false }
}
