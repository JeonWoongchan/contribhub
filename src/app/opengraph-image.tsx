import { ImageResponse } from 'next/og'
import { SITE_TITLE } from '@/lib/seo'

export const alt = `${SITE_TITLE} preview`
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

const ogDescription = 'A GitHub issue discovery service for developers starting open source contributions.'

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#f8fafc',
                    color: '#0f172a',
                    padding: 72,
                    fontFamily: 'Inter, Arial, sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        fontSize: 30,
                        fontWeight: 700,
                    }}
                >
                    <div
                        style={{
                            width: 54,
                            height: 54,
                            borderRadius: 14,
                            background: '#2563eb',
                        }}
                    />
                    {SITE_TITLE}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
                    <div
                        style={{
                            fontSize: 68,
                            lineHeight: 1.08,
                            letterSpacing: 0,
                            fontWeight: 800,
                            maxWidth: 940,
                        }}
                    >
                        Find open source issues that fit your stack
                    </div>
                    <div
                        style={{
                            color: '#475569',
                            fontSize: 30,
                            lineHeight: 1.35,
                            maxWidth: 920,
                        }}
                    >
                        {ogDescription}
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        gap: 16,
                        color: '#1d4ed8',
                        fontSize: 24,
                        fontWeight: 700,
                    }}
                >
                    GitHub OAuth / Issue scoring / Bookmarks / PR history
                </div>
            </div>
        ),
        size,
    )
}
