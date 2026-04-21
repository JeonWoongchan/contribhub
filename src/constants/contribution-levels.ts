
import type { ExperienceLevel, ContributionType, Purpose, WeeklyHours } from '@/types/user'

export const EXPERIENCE_LEVELS: {
    value: ExperienceLevel
    label: string
    description: string
}[] = [
    { value: 'beginner', label: '입문', description: '0~1년, 첫 오픈소스 기여' },
    { value: 'junior', label: '주니어', description: '1~3년, 기초 기여 경험 있음' },
    { value: 'mid', label: '미들', description: '3년 이상, 기능 구현 가능' },
    { value: 'senior', label: '시니어', description: '아키텍처 이해, 코드 리뷰 가능' },
]

export const CONTRIBUTION_TYPES: {
    value: ContributionType
    label: string
    description: string
}[] = [
    { value: 'doc', label: '문서 / 번역', description: 'README, docs 개선' },
    { value: 'bug', label: '버그 수정', description: 'good-first-issue 버그' },
    { value: 'feat', label: '기능 구현', description: '새 기능 추가' },
    { value: 'test', label: '테스트 작성', description: '커버리지 개선' },
    { value: 'review', label: '코드 리뷰', description: 'PR 리뷰 참여' },
]

export const PURPOSES: {
    value: Purpose
    label: string
    description: string
}[] = [
    { value: 'portfolio', label: '포트폴리오', description: '취업/이직에 활용' },
    { value: 'growth', label: '실력 향상', description: '코드 품질 개선' },
    { value: 'community', label: '커뮤니티', description: '오픈소스 생태계 기여' },
]

export const WEEKLY_HOURS: {
    value: WeeklyHours
    label: string
    description: string
}[] = [
    { value: 2, label: '2시간 이하', description: '짧고 빠른 기여 위주' },
    { value: 5, label: '5시간', description: '중간 규모 기여 가능' },
    { value: 10, label: '10시간 이상', description: '장기 기여도 가능' },
]