'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

export function SignInButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" variant="outline" size="lg" disabled={pending} className="w-full sm:w-auto">
            {pending ? '연결 중...' : 'GitHub로 시작하기'}
        </Button>
    )
}
