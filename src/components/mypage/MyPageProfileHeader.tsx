import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import type { MyPageData } from '@/lib/user/my-page'
import { formatDate } from '@/utils/format/date'

type MyPageProfileHeaderProps = {
  data: MyPageData
}

export function MyPageProfileHeader({ data }: MyPageProfileHeaderProps) {
  const name = data.profile.name
  return (
    <Card className="border border-border/70 bg-linear-to-br from-background via-card to-interactive-selected/20">
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="overflow-hidden rounded-3xl ring-1 ring-border/70">
              {data.profile.image ? (
                <Image
                  src={data.profile.image}
                  alt={name ?? data.profile.login}
                  width={72}
                  height={72}
                  className="size-18 bg-muted object-cover"
                />
              ) : (
                <div className="flex size-18 items-center justify-center bg-muted text-muted-foreground">
                  <UserRound className="size-8" />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">GitHub Profile</p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{name ?? data.profile.login}</h2>
                <p className="text-sm text-muted-foreground">@{data.profile.login}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-interactive-selected-border bg-background/70">
                  GitHub 연결 완료
                </Badge>
                {data.onboarding.updatedAt ? (
                  <Badge variant="outline" className="border-border/70 bg-background/70">
                    온보딩 수정일 {formatDate(data.onboarding.updatedAt)}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href={data.profile.githubProfileUrl} target="_blank" rel="noreferrer">
              GitHub 보기
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}
