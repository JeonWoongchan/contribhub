import type { Endpoints } from '@octokit/types'

export type GitHubRepo = Endpoints['GET /user/repos']['response']['data'][number]
export type GitHubIssue = Endpoints['GET /repos/{owner}/{repo}/issues']['response']['data'][number]
export type GitHubPullRequest = Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][number]
export type GitHubUser = Endpoints['GET /user']['response']['data']