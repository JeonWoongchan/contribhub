import type { NextResponse } from 'next/server'

import { err, ErrorCode } from '@/lib/api-response'
import { GitHubNotFoundError, GitHubRateLimitError, GitHubUnauthorizedError } from '@/lib/github/client'
import { GitHubProfileError } from '@/lib/github/profile'

type GitHubErrorResponseOptions = {
  fallbackMessage: string
  fallbackStatus?: number
  fallbackCode?: ErrorCode
  notFoundMessage?: string
  notFoundStatus?: number
  notFoundCode?: ErrorCode
}

export function getGitHubErrorResponse(
  error: unknown,
  {
    fallbackMessage,
    fallbackStatus = 502,
    fallbackCode = ErrorCode.GITHUB_ERROR,
    notFoundMessage,
    notFoundStatus = 404,
    notFoundCode = ErrorCode.INVALID_REPO,
  }: GitHubErrorResponseOptions
): NextResponse {
  if (error instanceof GitHubRateLimitError) {
    return err('GitHub API 요청 한도를 초과했습니다.', 429, ErrorCode.RATE_LIMITED)
  }

  if (error instanceof GitHubUnauthorizedError) {
    return err('GitHub 인증이 만료되었습니다. 다시 로그인해 주세요.', 401, ErrorCode.UNAUTHORIZED)
  }

  if (error instanceof GitHubNotFoundError && notFoundMessage) {
    return err(notFoundMessage, notFoundStatus, notFoundCode)
  }

  if (error instanceof GitHubProfileError) {
    if (error.status === 401) {
      return err('GitHub 인증이 만료되었습니다. 다시 로그인해 주세요.', 401, ErrorCode.UNAUTHORIZED)
    }
    if (error.status === 429) {
      return err('GitHub API 요청 한도를 초과했습니다.', 429, ErrorCode.RATE_LIMITED)
    }
    return err(error.message, error.status, ErrorCode.GITHUB_ERROR)
  }

  return err(fallbackMessage, fallbackStatus, fallbackCode)
}
