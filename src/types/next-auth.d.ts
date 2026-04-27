import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      login: string
    } & DefaultSession['user']
  }

  interface JWT {
    accessToken?: string
    githubLogin?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    githubLogin?: string
  }
}