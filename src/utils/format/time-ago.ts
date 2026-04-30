// 날짜 문자열을 상대 시간 문구로 변환하는 함수.
export function formatTimeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)

  if (days === 0) return '오늘'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  if (days < 365) return `${Math.floor(days / 30)}개월 전`

  return `${Math.floor(days / 365)}년 전`
}
