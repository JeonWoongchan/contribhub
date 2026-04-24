import sql from '@/lib/db'
import type { ContributionType } from '@/types/user'

type CreateBookmarkInput = {
  issueNumber: number
  repoFullName: string
  issueTitle: string
  issueUrl: string
  contributionType: ContributionType | null
}

export async function listUserBookmarkKeys(githubUserId: string): Promise<string[]> {
  const rows = await sql`
    SELECT b.repo_full_name, b.issue_number
    FROM bookmarks b
    JOIN users u ON u.id = b.user_id
    WHERE u.github_id = ${githubUserId}
  `

  return rows.map((row) => `${row.repo_full_name}#${row.issue_number}`)
}

export async function createBookmark(githubUserId: string, input: CreateBookmarkInput): Promise<void> {
  await sql`
    INSERT INTO bookmarks (
      user_id,
      issue_number,
      repo_full_name,
      issue_title,
      issue_url,
      contribution_type,
      status,
      updated_at
    )
    VALUES (
      (SELECT id FROM users WHERE github_id = ${githubUserId}),
      ${input.issueNumber},
      ${input.repoFullName},
      ${input.issueTitle},
      ${input.issueUrl},
      ${input.contributionType},
      'saved',
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
