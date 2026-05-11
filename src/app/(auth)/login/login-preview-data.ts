import type { LucideIcon } from 'lucide-react'
import { Bookmark, GitMerge, Sparkles } from 'lucide-react'
import type { IssueCardItem } from '@/types/issue'

export type Feature = {
    icon: LucideIcon
    text: string
}

export const FEATURES: Feature[] = [
    { icon: Sparkles, text: 'GitHub 프로필 및 사용자 온보딩 기반 이슈 추천' },
    { icon: GitMerge, text: '기여 난이도 점수로 내 수준에 맞는 이슈 탐색' },
    { icon: Bookmark, text: '북마크로 관심 이슈 저장 & PR 기록 관리' },
]

export function getDemoIssues(): IssueCardItem[] {
    const daysAgo = (days: number) =>
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    return [
        {
            number: 1234,
            title: 'Add configurable default tab size per workspace settings',
            url: '#',
            repoFullName: 'microsoft/vscode',
            repoUrl: '#',
            language: 'TypeScript',
            stargazerCount: 165200,
            labels: ['good first issue', 'enhancement'],
            commentCount: 3,
            createdAt: daysAgo(14),
            updatedAt: daysAgo(3),
            score: 82,
            difficultyLevel: 'junior',
            contributionType: 'feat',
            competitionLevel: 'OPEN',
            hasPR: false,
            repoActivityLevel: 'active',
            isBookmarked: false,
        },
        {
            number: 5678,
            title: 'Improve error messages for missing environment variables in config',
            url: '#',
            repoFullName: 'vercel/next.js',
            repoUrl: '#',
            language: 'TypeScript',
            stargazerCount: 128400,
            labels: ['documentation'],
            commentCount: 7,
            createdAt: daysAgo(21),
            updatedAt: daysAgo(5),
            score: 71,
            difficultyLevel: 'beginner',
            contributionType: 'doc',
            competitionLevel: 'OPEN',
            hasPR: false,
            repoActivityLevel: 'active',
            isBookmarked: false,
        },
        {
            number: 9012,
            title: 'Update useEffect cleanup function documentation example',
            url: '#',
            repoFullName: 'facebook/react',
            repoUrl: '#',
            language: 'JavaScript',
            stargazerCount: 228100,
            labels: ['good first issue'],
            commentCount: 2,
            createdAt: daysAgo(10),
            updatedAt: daysAgo(4),
            score: 63,
            difficultyLevel: 'beginner',
            contributionType: 'doc',
            competitionLevel: 'OPEN',
            hasPR: false,
            repoActivityLevel: 'active',
            isBookmarked: false,
        },
    ]
}
