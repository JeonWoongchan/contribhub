import type { ApiResponse } from '@/types/api'

export function redirectToLogin(): void {
  if (typeof window === 'undefined') return
  window.location.assign('/')
}

export function isUnauthorizedApiResponse<T>(
  response: Response,
  json: ApiResponse<T>
): boolean {
  return response.status === 401 && !json.ok &&
    (json.error?.code === 'UNAUTHORIZED' || json.error?.code === 'NO_ACCESS_TOKEN')
}
