import Link from 'next/link'
import { Bookmark, GitPullRequestArrow, Map, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MainHeader } from '@/components/layout/MainHeader'
import { AppFooter } from '@/components/layout/AppFooter'

const featureItems = [
    {
        icon: Search,
        title: '기여 가능한 이슈 탐색',
        description: 'GitHub 이슈를 언어, 난이도, 라벨, 활동성 기준으로 확인합니다.',
    },
    {
        icon: Map,
        title: '온보딩 기반 추천',
        description: '관심 언어와 기여 목적을 반영해 시작하기 좋은 이슈를 우선 보여줍니다.',
    },
    {
        icon: Bookmark,
        title: '관심 이슈 저장',
        description: '나중에 다시 볼 이슈를 북마크하고 기여 후보를 정리합니다.',
    },
    {
        icon: GitPullRequestArrow,
        title: 'PR 기록 확인',
        description: '제출한 Pull Request 기록을 모아 오픈소스 기여 흐름을 추적합니다.',
    },
]

export function HomeLanding() {
    return (
        <div className="min-h-screen bg-background">
            <MainHeader image={null} name={null} isGuest />
            <main className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-12 sm:py-16">
                <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                    <div className="flex flex-col gap-7">
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase text-primary">
                                Open Source Issue Discovery
                            </p>
                            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                                나에게 맞는 오픈소스 이슈를 추천받아보세요
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                                Open Issue Map은 GitHub 프로필과 온보딩 정보를 바탕으로
                                초보자도 검토해볼 만한 오픈소스 이슈를 추천하는 개발자용 웹 서비스입니다.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button asChild variant="interactive" size="lg">
                                <Link href="/dashboard">추천 이슈 미리보기</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/login">GitHub로 시작하기</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        {featureItems.map(({ icon: Icon, title, description }) => (
                            <article
                                key={title}
                                className="rounded-md border border-border bg-card p-5 shadow-sm"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-primary">
                                        <Icon className="size-4" aria-hidden="true" />
                                    </span>
                                    <div className="space-y-1">
                                        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                                        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
                <section
                    aria-labelledby="seo-public-summary"
                    className="rounded-md border border-border/70 bg-muted/30 p-6"
                >
                    <div className="max-w-3xl space-y-3">
                        <h2 id="seo-public-summary" className="text-lg font-semibold text-foreground">
                            오픈소스 첫 기여를 위한 탐색 흐름
                        </h2>
                        <p className="text-sm leading-7 text-muted-foreground">
                            관심 언어를 고르고, 추천 이슈를 비교하고, 북마크로 후보를 저장한 뒤
                            실제 GitHub 이슈에서 claim과 PR 흐름을 이어갈 수 있도록 돕는 것이 목표입니다.
                        </p>
                    </div>
                </section>
            </main>
            <div className="mx-auto max-w-5xl px-4">
                <AppFooter />
            </div>
        </div>
    )
}
