import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'
import type { FormState, OnboardingStepConfig, OptionItem } from '@/types/onboarding'

export const EXPERIENCE_LEVELS: OptionItem<ExperienceLevel>[] = [
  {
    value: 'beginner',
    label: '입문',
    description: '오픈소스 기여가 처음이거나 아직 경험이 거의 없어요.',
  },
  {
    value: 'junior',
    label: '주니어',
    description: '작은 수정이나 문서 기여를 몇 번 해본 적이 있어요.',
  },
  {
    value: 'mid',
    label: '미드',
    description: '기능 구현과 버그 수정까지 비교적 익숙하게 진행할 수 있어요.',
  },
  {
    value: 'senior',
    label: '시니어',
    description: '구조 설계, 코드 리뷰, 협업 흐름까지 주도할 수 있어요.',
  },
]

export const CONTRIBUTION_TYPES: OptionItem<ContributionType>[] = [
  {
    value: 'doc',
    label: '문서 / 번역',
    description: 'README, 가이드, 문서 개선에 집중하고 싶어요.',
  },
  {
    value: 'bug',
    label: '버그 수정',
    description: '작은 이슈부터 직접 고치며 기여하고 싶어요.',
  },
  {
    value: 'feat',
    label: '기능 구현',
    description: '새 기능 개발이나 개선 작업에 참여하고 싶어요.',
  },
  {
    value: 'test',
    label: '테스트 작성',
    description: '안정성을 높이는 테스트와 검증에 관심이 있어요.',
  },
  {
    value: 'review',
    label: '코드 리뷰',
    description: 'PR 리뷰와 피드백 중심으로 참여하고 싶어요.',
  },
]

export const WEEKLY_HOURS: OptionItem<WeeklyHours>[] = [
  {
    value: 2,
    label: '주 2시간 이하',
    description: '부담 없이 가볍게 시작할 수 있는 정도예요.',
  },
  {
    value: 5,
    label: '주 5시간',
    description: '꾸준히 참여하면서 작은 단위 작업을 이어갈 수 있어요.',
  },
  {
    value: 10,
    label: '주 10시간 이상',
    description: '기능 단위 작업도 책임지고 진행할 수 있어요.',
  },
]

export const PURPOSES: OptionItem<Purpose>[] = [
  {
    value: 'portfolio',
    label: '포트폴리오',
    description: '취업이나 이직에 도움이 되는 결과물을 만들고 싶어요.',
  },
  {
    value: 'growth',
    label: '실력 향상',
    description: '협업과 코드 품질 관점에서 한 단계 성장하고 싶어요.',
  },
  {
    value: 'community',
    label: '커뮤니티',
    description: '오픈소스 생태계에 꾸준히 기여하며 연결되고 싶어요.',
  },
]

export const ENGLISH_OPTIONS: OptionItem<boolean>[] = [
  {
    value: true,
    label: '영어 이슈도 괜찮아요',
    description: '영문 이슈와 문서를 포함해서 추천받아도 괜찮아요.',
  },
  {
    value: false,
    label: '한글 중심이 좋아요',
    description: '가능하면 한글 맥락으로 시작할 수 있는 항목을 원해요.',
  },
]

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  { id: 'experienceLevel', label: '경험 수준' },
  { id: 'contributionTypes', label: '기여 방식' },
  { id: 'weeklyHours', label: '투입 시간' },
  { id: 'englishOk', label: '영어 선호' },
  { id: 'purpose', label: '참여 목적' },
]

export function isStepComplete(stepIndex: number, form: FormState): boolean {
  const step = ONBOARDING_STEPS[stepIndex]

  switch (step?.id) {
    case 'experienceLevel':
      return form.experienceLevel !== null
    case 'contributionTypes':
      return form.contributionTypes.length > 0
    case 'weeklyHours':
      return form.weeklyHours !== null
    case 'englishOk':
      return true
    case 'purpose':
      return form.purpose !== null
    default:
      return false
  }
}
