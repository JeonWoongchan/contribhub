import Link from 'next/link'

export function OnboardingFooter() {
    return (
        <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>설정은 언제든지 마이페이지에서 확인하고 다시 할 수 있어요.</p>
            <Link
                href="/"
                className="inline-block underline underline-offset-4 transition-colors hover:text-foreground"
            >
                홈으로 이동
            </Link>
        </div>
    )
}
