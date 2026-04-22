import { HEALTH_SCORE_TIERS } from '@/constants/scoring-rules'
import type { HealthTier } from '@/lib/github/issue-badge-meta'

// 레포 활성도 점수를 표시용 등급으로 변환하는 함수.
export function getHealthTier(score: number): HealthTier {
  if (score >= HEALTH_SCORE_TIERS.HIGH) {
    return { label: '활성', variant: 'success', isAnimated: true }
  }

  if (score >= HEALTH_SCORE_TIERS.MID) {
    return { label: '보통', variant: 'warning', isAnimated: false }
  }

  if (score >= HEALTH_SCORE_TIERS.LOW) {
    return { label: '저조', variant: 'warning', isAnimated: false }
  }

  return { label: '비활성', variant: 'danger', isAnimated: false }
}
