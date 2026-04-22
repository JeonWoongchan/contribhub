import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
      <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">OpenIssueMap</CardTitle>
            <CardDescription>
              내 GitHub 프로필 기반으로 기여 가능한 오픈소스 이슈를 매칭해드려요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
                action={async () => {
                  'use server'
                  await signIn('github', { redirectTo: '/dashboard' })
                }}
            >
              <Button type="submit" className="w-full" size="lg">
                GitHub으로 로그인
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
  )
}
