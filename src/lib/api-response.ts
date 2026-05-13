// API 응답 형식 통일 — 성공/실패 포맷 일관화
import { NextResponse } from 'next/server'

export const ErrorCode = {
  UNAUTHORIZED:        'UNAUTHORIZED',
  NO_ACCESS_TOKEN:     'NO_ACCESS_TOKEN',
  RATE_LIMITED:        'RATE_LIMITED',
  ONBOARDING_REQUIRED: 'ONBOARDING_REQUIRED',
  INVALID_REQUEST:     'INVALID_REQUEST',
  INVALID_REPO:        'INVALID_REPO',
  GITHUB_ERROR:        'GITHUB_ERROR',
  INTERNAL_ERROR:      'INTERNAL_ERROR',
} as const

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode]

// 성공 응답
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status })
}

// 실패 응답
export function err(message: string, status: number, code?: ErrorCode) {
  return NextResponse.json({ ok: false, error: { message, code } }, { status })
}
