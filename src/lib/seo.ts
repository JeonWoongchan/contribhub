export const SITE_TITLE = 'Open Issue Map'

export const SITE_DESCRIPTION =
    '오픈소스에 기여하고 싶지만 어디서 시작할지 모르는 개발자를 위한 GitHub 이슈 추천 서비스입니다.'

export const SITE_KEYWORDS = [
    '오픈소스 기여',
    'GitHub 이슈 추천',
    'good first issue',
    '오픈소스 첫 기여',
    '개발자 포트폴리오',
    'GitHub PR',
]

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://openissuemap.com'

export const SITE_URL = new URL(rawSiteUrl.endsWith('/') ? rawSiteUrl : `${rawSiteUrl}/`)

export function absoluteUrl(path = '/') {
    return new URL(path, SITE_URL).toString()
}
