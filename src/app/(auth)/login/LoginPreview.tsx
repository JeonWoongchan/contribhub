import { IssueMockCard } from './IssueMockCard'
import { FEATURES, getDemoIssues } from './login-preview-data'

export function LoginPreview() {
    const demoIssues = getDemoIssues()

    return (
        <div className="flex w-full max-w-lg flex-col gap-8">
            <div className="space-y-6">
                <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                        Open Issue Map
                    </p>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                        내 기술 스택에 맞는
                        <br />
                        오픈소스에 기여해보세요
                    </h1>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        GitHub 프로필과 온보딩 기반으로 기여 가능한 이슈를 점수화해 추천합니다.
                    </p>
                </div>
                <ul className="flex flex-col gap-2.5">
                    {FEATURES.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-center gap-2.5 text-sm text-foreground">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-primary">
                                <Icon className="size-3" />
                            </span>
                            {text}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="relative">
                <div className="flex flex-col gap-3">
                    {demoIssues.map((issue) => (
                        <IssueMockCard key={issue.number} issue={issue} />
                    ))}
                </div>
                {/* 넘치는 카드를 자연스럽게 페이드아웃 */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-background to-transparent" />
            </div>
        </div>
    )
}
