import sql from '@/lib/db'
import type { Bookmark } from '@/types/bookmark'
import type { ContributionType } from '@/types/user'

type CreateBookmarkInput = {
  issueNumber: number
  repoFullName: string
  issueTitle: string
  issueUrl: string
  contributionType: ContributionType | null
}

type ListUserBookmarksOptions = {
  limit?: number
  offset?: number
}

// 사용자 북마크 키 목록 조회 함수
export async function listUserBookmarkKeys(githubUserId: string): Promise<string[]> {
  const rows = await sql`
    SELECT b.repo_full_name, b.issue_number
    FROM bookmarks b
    JOIN users u ON u.id = b.user_id
    WHERE u.github_id = ${githubUserId}
  `

  return rows.map((row) => `${row.repo_full_name}#${row.issue_number}`)
}

// 사용자 북마크 목록 조회 함수
export async function listUserBookmarks(
  githubUserId: string,
  options?: ListUserBookmarksOptions
): Promise<Bookmark[]> {
  const limit = options?.limit ?? 20
  const offset = options?.offset ?? 0

  const rows = await sql`
    SELECT
      b.id,
      b.issue_number,
      b.repo_full_name,
      b.issue_title,
      b.issue_url,
      b.contribution_type,
      b.created_at,
      b.updated_at
    FROM bookmarks b
    JOIN users u ON u.id = b.user_id
    WHERE u.github_id = ${githubUserId}
    ORDER BY b.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  return rows.map((row) => ({
    id: row.id,
    issueNumber: row.issue_number,
    repoFullName: row.repo_full_name,
    issueTitle: row.issue_title,
    issueUrl: row.issue_url,
    contributionType: row.contribution_type,
    createdAt: row.created_at?.toISOString?.() ?? String(row.created_at),
    updatedAt: row.updated_at?.toISOString?.() ?? String(row.updated_at),
    githubIssue: null,
  }))
}

// 사용자 북마크 개수 조회 함수
export async function countUserBookmarks(githubUserId: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM bookmarks b
    JOIN users u ON u.id = b.user_id
    WHERE u.github_id = ${githubUserId}
  `

  return rows[0]?.count ?? 0
}

// 북마크 저장 함수
export async function createBookmark(githubUserId: string, input: CreateBookmarkInput): Promise<void> {
  await sql`
    INSERT INTO bookmarks (
      user_id,
      issue_number,
      repo_full_name,
      issue_title,
      issue_url,
      contribution_type,
      updated_at
    )
    VALUES (
      (SELECT id FROM users WHERE github_id = ${githubUserId}),
      ${input.issueNumber},
      ${input.repoFullName},
      ${input.issueTitle},
      ${input.issueUrl},
      ${input.contributionType},
      NOW()
    )
    ON CONFLICT (user_id, repo_full_name, issue_number)
    DO UPDATE SET
      issue_title = EXCLUDED.issue_title,
      issue_url = EXCLUDED.issue_url,
      contribution_type = EXCLUDED.contribution_type,
      updated_at = NOW()
  `
}

// 북마크 삭제 함수
export async function deleteBookmark(
  githubUserId: string,
  repoFullName: string,
  issueNumber: number
): Promise<void> {
  await sql`
    DELETE FROM bookmarks b
    USING users u
    WHERE b.user_id = u.id
      AND u.github_id = ${githubUserId}
      AND b.repo_full_name = ${repoFullName}
      AND b.issue_number = ${issueNumber}
  `
}
