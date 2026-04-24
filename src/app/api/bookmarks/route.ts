import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { createBookmark, deleteBookmark } from '@/lib/bookmarks'
import { getBookmarkList } from '@/lib/bookmark-list'
import type { ContributionType } from '@/types/user'

type BookmarkRequestBody = {
  issueNumber: number
  repoFullName: string
  issueTitle?: string
  issueUrl?: string
  contributionType?: ContributionType | null
}

function isBookmarkRequestBody(value: unknown): value is BookmarkRequestBody {
  if (!value || typeof value !== 'object') {
    return false
  }

  const body = value as Record<string, unknown>

  return (
    typeof body.issueNumber === 'number' &&
    Number.isInteger(body.issueNumber) &&
    typeof body.repoFullName === 'string'
  )
}

export async function GET(req: NextRequest) {
  // GitHub 토큰 기반 사용자 인증 단계.
  const authResult = await requireGithubToken(req)
  if (!authResult.ok) return err(authResult.error, authResult.status, authResult.code)

  // 페이지네이션 쿼리 파라미터 정규화 단계.
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '20') || 20, 20)
  const offset = Math.max(Number(searchParams.get('offset') ?? '0') || 0, 0)

  // 북마크 목록 조회 서비스 호출 단계.
  const bookmarkList = await getBookmarkList({
    userId: authResult.userId,
    accessToken: authResult.accessToken,
    limit,
    offset,
  })

  // 북마크 목록 응답 반환 단계.
  return ok(bookmarkList)
}

export async function POST(req: Request) {
  // 세션 기반 사용자 인증 단계.
  const session = await auth()
  if (!session) return err('Unauthorized', 401, ErrorCode.UNAUTHORIZED)

  // 요청 본문 파싱 및 유효성 검증 단계.
  const body = (await req.json().catch(() => null)) as unknown
  if (!isBookmarkRequestBody(body) || typeof body.issueTitle !== 'string' || typeof body.issueUrl !== 'string') {
    return err('Invalid bookmark payload', 400)
  }

  // 북마크 저장 단계.
  await createBookmark(session.user.id, {
    issueNumber: body.issueNumber,
    repoFullName: body.repoFullName,
    issueTitle: body.issueTitle,
    issueUrl: body.issueUrl,
    contributionType: body.contributionType ?? null,
  })

  // 저장 결과 응답 반환 단계.
  return ok({ saved: true }, 201)
}

export async function DELETE(req: Request) {
  // 세션 기반 사용자 인증 단계.
  const session = await auth()
  if (!session) return err('Unauthorized', 401, ErrorCode.UNAUTHORIZED)

  // 요청 본문 파싱 및 유효성 검증 단계.
  const body = (await req.json().catch(() => null)) as unknown
  if (!isBookmarkRequestBody(body)) {
    return err('Invalid bookmark payload', 400)
  }

  // 북마크 삭제 단계.
  await deleteBookmark(session.user.id, body.repoFullName, body.issueNumber)

  // 삭제 결과 응답 반환 단계.
  return ok({ deleted: true })
}
