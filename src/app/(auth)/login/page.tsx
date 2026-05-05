import { signIn } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginButton } from './LoginButton'
import { LoginPreview } from './LoginPreview'

export default function LoginPage() {
    return (
        <div className="mx-auto grid h-screen max-w-6xl overflow-hidden bg-linear-to-br from-background via-background to-brand-subtle/20 lg:grid-cols-[1fr_460px]">
            {/* 서비스 소개 — 데스크톱에서만 표시 */}
            <div className="hidden items-center overflow-hidden px-12 py-10 lg:flex">
                <LoginPreview />
            </div>

            {/* 로그인 */}
            <div className="flex items-center justify-center border-l border-border/50 px-8 py-16">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Open Issue Map</CardTitle>
                        <CardDescription>
                            GitHub 프로필과 온보딩 기반으로 기여 가능한 오픈소스 이슈를 매칭해드려요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            action={async () => {
                                'use server'
                                await signIn('github', { redirectTo: '/dashboard' })
                            }}
                        >
                            <LoginButton />
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
