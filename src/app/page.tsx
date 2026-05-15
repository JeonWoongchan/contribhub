import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'
import { HomeLanding } from '@/components/landing/HomeLanding'
import { createHomeJsonLd, createPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = createPageMetadata({ canonicalPath: '/' })

export default function HomePage() {
    return (
        <>
            <JsonLd data={createHomeJsonLd()} />
            <HomeLanding />
        </>
    )
}
