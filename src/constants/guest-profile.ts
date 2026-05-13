import type { OnboardingProfile } from '@/lib/user/profile'

// 게스트(미로그인) 사용자에게 보여줄 기본 온보딩 프로필
// 가장 접근하기 쉽고 인기 있는 조합으로 설정
export const GUEST_ONBOARDING_PROFILE: OnboardingProfile = {
    topLanguages: ['TypeScript', 'JavaScript', 'Python'],
    experienceLevel: 'beginner',
    contributionTypes: ['doc', 'bug'],
    weeklyHours: 5,
    purpose: 'portfolio',
}
