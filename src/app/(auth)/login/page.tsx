import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, signIn } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoginButton } from './LoginButton'
import { LoginPreview } from './LoginPreview'

export default async function LoginPage() {
    const session = await auth()
    if (session) redirect('/dashboard')

    return (
        <div className="mx-auto flex min-h-svh max-w-6xl flex-col lg:grid lg:h-screen lg:grid-cols-[1fr_460px] lg:overflow-hidden">
            {/* scrollbar-gutter 영역까지 그라디언트를 채우기 위해 fixed로 viewport 전체 커버 */}
            <div className="fixed inset-0 -z-10 bg-linear-to-br from-background via-background to-brand-subtle/20" aria-hidden="true" />
            {/* 서비스 소개 — 데스크톱에서만 표시 */}
            <div className="items-center overflow-hidden px-6 py-5 lg:px-12 lg:py-10">
                <LoginPreview />
            </div>

            {/* 로그인 */}
            <div className="flex flex-1 items-start justify-center px-6 pb-10 pt-8 lg:items-center lg:border-l lg:border-border/50 lg:px-8 lg:py-16">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-interactive-action">Open Issue Map</CardTitle>
                        <CardDescription>
                            GitHub 프로필과 온보딩 기반으로 기여 가능한 오픈소스 이슈를 매칭해드려요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <form
                            action={async () => {
                                'use server'
                                await signIn('github', { redirectTo: '/dashboard' })
                            }}
                        >
                            <LoginButton />
                        </form>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/dashboard">서비스 미리보기</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
