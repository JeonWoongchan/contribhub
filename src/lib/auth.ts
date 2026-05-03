import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import sql from '@/lib/db'
import { env } from '@/lib/env'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: { scope: 'read:user' },
      },
    }),
  ],
  callbacks: {
    // 로그인 시 최초 1회 실행 — account, profile 있음
    // 이후 요청에서는 HttpOnly 쿠키의 JWT를 복호화해서 token만 전달됨 (DB/네트워크 요청 없음)
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        // 최초 로그인 시에만 진입 — GitHub OAuth 토큰 + 유저 정보 JWT에 저장
        token.accessToken = account.access_token
        token.githubId = String(profile?.id)
        token.githubLogin = profile?.login as string

        // 로그인 시 1회만 DB upsert
        await sql`
          INSERT INTO users (github_id, github_login, avatar_url)
          VALUES (
            ${String(profile?.id)},
            ${profile?.login as string},
            ${profile?.avatar_url as string}
          )
          ON CONFLICT (github_id)
          DO UPDATE SET
            github_login = EXCLUDED.github_login,
            avatar_url   = EXCLUDED.avatar_url
        `
      }
      return token
    },
    // auth() 호출 시마다 실행 — HttpOnly 쿠키의 JWT를 복호화한 token을 session으로 변환
    // 네트워크 요청 없이 쿠키 읽기만 하므로 매우 가벼움
    async session({ session, token }) {
      session.user.id = token.githubId as string
      session.user.login = token.githubLogin ?? ''
      return session
    },
  },
})
