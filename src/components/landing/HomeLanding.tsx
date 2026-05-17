import Link from 'next/link'
import { Bookmark, GitPullRequestArrow, Map, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        <main className="min-h-screen mx-auto flex max-w-5xl flex-col px-4 py-8">
            <div className="flex flex-1 items-center">
                <section className="grid w-full gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                    <div className="flex flex-col gap-7">
                        <div className="space-y-4">
                            <p className="text-lg font-semibold text-primary">
                                Open Issue Map
                            </p>
                            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-5xl">
                                나에게 맞는 오픈소스<br/> 이슈를 추천받아보세요
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                                Open Issue Map은 GitHub 프로필과 온보딩 정보를 바탕으로
                            <br/>
                                검토해볼 만한 오픈소스 이슈를 추천하는 개발자용 웹 서비스입니다.
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
            </div>
            <AppFooter />
        </main>
    )
}
