import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import sql from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'read:user public_repo' },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
        token.githubId = String(profile?.id)  // 추가

        await sql`
          INSERT INTO users (github_id, github_login, avatar_url, access_token)
          VALUES (
                   ${String(profile?.id)},
                   ${profile?.login as string},
                   ${profile?.avatar_url as string},
                   ${account.access_token}
                 )
            ON CONFLICT (github_id)
        DO UPDATE SET
            github_login = EXCLUDED.github_login,
                         avatar_url = EXCLUDED.avatar_url,
                         access_token = EXCLUDED.access_token
        `
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.githubId as string  // 여기 수정
      return session
    },
  },
})