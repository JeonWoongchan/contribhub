'use server'

import { signIn, signOut } from '@/lib/auth'

export async function signInWithGitHub() {
    await signIn('github', { redirectTo: '/dashboard' })
}

export async function signOutToHome() {
    await signOut({ redirectTo: '/' })
}
