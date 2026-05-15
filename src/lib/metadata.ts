import type { Metadata } from 'next'
import { absoluteUrl, SITE_DESCRIPTION, SITE_TITLE } from '@/lib/seo'

type CreatePageMetadataOptions = {
  title?: string
  description?: string
  canonicalPath: string
}

export function createPageMetadata({
  title,
  description,
  canonicalPath,
}: CreatePageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
  }
}

export function createNoIndexMetadata({
  title,
  description,
}: {
  title?: string
  description?: string
} = {}): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }
}

export function createHomeJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_TITLE,
      url: absoluteUrl('/'),
      description: SITE_DESCRIPTION,
      inLanguage: 'ko-KR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_TITLE,
      url: absoluteUrl('/'),
      description: SITE_DESCRIPTION,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      inLanguage: 'ko-KR',
      isAccessibleForFree: true,
    },
  ]
}
