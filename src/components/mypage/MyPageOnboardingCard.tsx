import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MyPageData } from '@/lib/user/my-page'
import {
  getContributionTypeLabel,
  getExperienceLevelLabel,
  getPurposeLabel,
  getWeeklyHoursLabel,
  renderMyPageValue,
} from './my-page-labels'
import { MyPageProfileField } from './MyPageProfileField'

type MyPageOnboardingCardProps = {
  onboarding: MyPageData['onboarding']
}

export function MyPageOnboardingCard({ onboarding }: MyPageOnboardingCardProps) {
  return (
    <Card className="border border-border/70 bg-card/95">
      <CardHeader>
        <CardTitle>내 추천 기준</CardTitle>
        <CardDescription>
          온보딩 답변을 추천 프로필 형태로 정리했습니다. 이 값들이 현재 이슈 추천과 북마크 점수 계산에
          반영됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <MyPageProfileField
            label="경험 수준"
            value={renderMyPageValue(getExperienceLevelLabel(onboarding.experienceLevel))}
          />
          <MyPageProfileField
            label="주간 가능 시간"
            value={renderMyPageValue(getWeeklyHoursLabel(onboarding.weeklyHours))}
          />
          <MyPageProfileField
            label="기여 목적"
            value={renderMyPageValue(getPurposeLabel(onboarding.purpose))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <MyPageProfileField
            label="선호 언어"
            value={
              onboarding.topLanguages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {onboarding.topLanguages.map((language) => (
                    <Badge key={language} variant="outline" className="bg-background/70 text-foreground">
                      {language}
                    </Badge>
                  ))}
                </div>
              ) : (
                '아직 설정되지 않았습니다.'
              )
            }
          />
          <MyPageProfileField
            label="기여 방식"
            value={
              onboarding.contributionTypes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {onboarding.contributionTypes.map((type) => (
                    <Badge key={type} variant="outline" className="bg-background/70 text-foreground">
                      {getContributionTypeLabel(type)}
                    </Badge>
                  ))}
                </div>
              ) : (
                '아직 설정되지 않았습니다.'
              )
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
