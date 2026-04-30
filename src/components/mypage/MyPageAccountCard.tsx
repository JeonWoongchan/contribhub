import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { MyPageData } from '@/lib/user/my-page'
import { formatDate } from '@/utils/format/date'
import { MyPageProfileField } from './MyPageProfileField'

type MyPageAccountCardProps = {
  profile: MyPageData['profile']
}

export function MyPageAccountCard({ profile }: MyPageAccountCardProps) {
  return (
    <Card className="border border-border/70 bg-card/95">
      <CardHeader>
        <CardTitle>계정 정보</CardTitle>
        <CardDescription>계정 연결 상태와 기본 프로필 정보를 보여줍니다.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <MyPageProfileField label="GitHub 아이디" value={`@${profile.login}`} />
        <MyPageProfileField label="가입 시점" value={formatDate(profile.joinedAt)} />
      </CardContent>
    </Card>
  )
}
