import { auth } from '@/lib/auth'
import { err, ErrorCode, ok } from '@/lib/api-response'
import { createBookmark, deleteBookmark } from '@/lib/bookmarks'
import type { ContributionType } from '@/types/user'

type BookmarkMutationBody = {
  issueNumber: number
  repoFullName: string
  issueTitle?: string
  issueUrl?: string
  contributionType?: ContributionType | null
}

function isBookmarkMutationBody(value: unknown): value is BookmarkMutationBody {
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

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return err('Unauthorized', 401, ErrorCode.UNAUTHORIZED)

  const body = (await req.json().catch(() => null)) as unknown
  if (!isBookmarkMutationBody(body) || typeof body.issueTitle !== 'string' || typeof body.issueUrl !== 'string') {
    return err('Invalid bookmark payload', 400)
  }

  await createBookmark(session.user.id, {
    issueNumber: body.issueNumber,
    repoFullName: body.repoFullName,
    issueTitle: body.issueTitle,
    issueUrl: body.issueUrl,
    contributionType: body.contributionType ?? null,
  })

  return ok({ saved: true }, 201)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) return err('Unauthorized', 401, ErrorCode.UNAUTHORIZED)

  const body = (await req.json().catch(() => null)) as unknown
  if (!isBookmarkMutationBody(body)) {
    return err('Invalid bookmark payload', 400)
  }

  await deleteBookmark(session.user.id, body.repoFullName, body.issueNumber)

  return ok({ deleted: true })
}
