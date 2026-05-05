'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

export function LoginButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? '로그인 중...' : 'GitHub으로 로그인'}
        </Button>
    )
}
