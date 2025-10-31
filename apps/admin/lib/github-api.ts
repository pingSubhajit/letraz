import {getCookie} from 'cookies-next'

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  private: boolean
  owner?: {
    login: string
    id: number
    avatar_url?: string
    html_url?: string
  } | null
}

export interface GitHubWebhook {
  id: number
  url: string
  active: boolean
  events: string[]
  config: {
    url: string
    content_type: string
    secret: string
  }
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
  }
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  html_url: string
  state: 'open' | 'closed'
}

export interface GitHubPR {
  id: number
  number: number
  title: string
  html_url: string
  state: 'open' | 'closed' | 'merged'
  draft: boolean
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
    sha: string
  }
}

export interface GitHubLabel {
  id: number
  name: string
  color?: string
  description?: string | null
}

export interface GitHubUserSummary {
  id: number
  login: string
  type?: string
}

export interface GitHubMilestone {
  id: number
  number: number
  title: string
}

export class GitHubAPIClient {
	private accessToken: string | null = null

	private appToken: string | null = null

	private baseURL = 'https://api.github.com'

	constructor(accessToken?: string, appToken?: string) {
		if (appToken) {
			this.appToken = appToken
		} else if (accessToken) {
			this.accessToken = accessToken
		} else {
			this.accessToken = this.getStoredToken()
		}
	}

	private getStoredToken(): string {
		if (typeof window !== 'undefined') {
			return getCookie('github_access_token') as string || ''
		}
		return ''
	}

	/**
	 * Set GitHub App token for API calls
	 */
	setAppToken(token: string): void {
		this.appToken = token
		this.accessToken = null // Clear OAuth token when using app token
	}

	/**
	 * Check if using app token
	 */
	isUsingAppToken(): boolean {
		return !!this.appToken
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseURL}${endpoint}`
		const token = this.appToken || this.accessToken
		const headers = {
			'Authorization': `Bearer ${token}`,
			'Accept': 'application/vnd.github.v3+json',
			'User-Agent': 'Letraz-Admin/1.0',
			...options.headers
		}

		const response = await fetch(url, {
			...options,
			headers
		})

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
		}

		return response.json()
	}

	// User methods
	async getCurrentUser(): Promise<GitHubUser> {
		return this.request<GitHubUser>('/user')
	}

	// Repository methods
	async getUserRepositories(): Promise<GitHubRepository[]> {
		const repos: GitHubRepository[] = []
		let page = 1
		const perPage = 100

		while (true) {
			const response = await this.request<GitHubRepository[]>(
				`/user/repos?per_page=${perPage}&page=${page}&sort=updated`
			)

			if (response.length === 0) break

			// Filter out repositories without owner or with invalid owner structure
			const validRepos = response.filter(repo => repo.owner && repo.owner.login)
			repos.push(...validRepos)
			page++

			// GitHub API has a limit of 100 pages
			if (page > 100) break
		}

		return repos
	}

	async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
		return this.request<GitHubRepository>(`/repos/${owner}/${repo}`)
	}

	// Webhook methods
	async createWebhook(owner: string, repo: string, webhookUrl: string, secret: string): Promise<GitHubWebhook> {
		const webhookData = {
			name: 'web',
			active: true,
			events: ['push'],
			config: {
				url: webhookUrl,
				content_type: 'json',
				secret: secret
			}
		}

		try {
			const response = await this.request<GitHubWebhook>(`/repos/${owner}/${repo}/hooks`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(webhookData)
			})
			return response
		} catch (error) {
			// Enhanced error handling for webhook creation
			if (error instanceof Error) {
				const message = error.message
				if (message.includes('404')) {
					throw new Error(`Repository ${owner}/${repo} not found. Please check if the repository exists and is accessible.`)
				} else if (message.includes('403')) {
					throw new Error(`Access denied to repository ${owner}/${repo}. Please ensure:\n1. Your GitHub token has admin access to this repository\n2. The repository exists and is accessible\n3. If the repository is private, your token must have the correct permissions`)
				} else if (message.includes('422')) {
					// Check if webhook already exists or there's a configuration issue
					const conflictingWebhooks = await this.findConflictingWebhooks(owner, repo, webhookUrl)

					if (conflictingWebhooks.length > 0) {
						const webhookList = conflictingWebhooks.map(hook => `- ID: ${hook.id}, URL: ${hook.config.url}, Events: [${hook.events.join(', ')}]`).join('\n')

						throw new Error(`Webhook conflict detected for ${owner}/${repo}. Found ${conflictingWebhooks.length} conflicting webhook(s):\n${webhookList}\n\nTo fix this:\n1. Go to https://github.com/${owner}/${repo}/settings/hooks\n2. Delete the conflicting webhook(s)\n3. Try adding the repository again\n\nNote: Look for webhooks with URL containing 'localhost:3000'`)
					} else {
						throw new Error(`Invalid webhook configuration for ${owner}/${repo}. Please check your repository permissions and try again.`)
					}
				} else if (message.includes('401')) {
					throw new Error('GitHub authentication failed. Please check your GitHub token.')
				}
			}
			throw error
		}
	}

	async getWebhooks(owner: string, repo: string): Promise<GitHubWebhook[]> {
		return this.request<GitHubWebhook[]>(`/repos/${owner}/${repo}/hooks`)
	}

	async deleteWebhook(owner: string, repo: string, hookId: number): Promise<void> {
		await this.request(`/repos/${owner}/${repo}/hooks/${hookId}`, {
			method: 'DELETE'
		})
	}

	async findConflictingWebhooks(owner: string, repo: string, targetUrl: string): Promise<GitHubWebhook[]> {
		const webhooks = await this.getWebhooks(owner, repo)
		const normalizedTargetUrl = targetUrl.replace(/\/$/, '')

		return webhooks.filter(hook => {
			const hookUrl = hook.config.url.replace(/\/$/, '')
			// Check for URL conflicts (same URL or development vs production conflicts)
			return hookUrl === normalizedTargetUrl ||
             (hookUrl.includes('localhost') && normalizedTargetUrl.includes('localhost')) ||
             (hookUrl.includes('github.com') && normalizedTargetUrl.includes('localhost'))
		})
	}

	// Branch methods
	async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
		return this.request<GitHubBranch[]>(`/repos/${owner}/${repo}/branches`)
	}

	// Issue methods
	async getRepositoryIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
		const issues: GitHubIssue[] = []
		let page = 1
		const perPage = 100

		while (true) {
			const response: GitHubIssue[] = await this.request(
				`/repos/${owner}/${repo}/issues?per_page=${perPage}&page=${page}&state=all`
			)

			if (response.length === 0) break

			issues.push(...response)
			page++

			if (page > 100) break
		}

		return issues
	}

	async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue & { milestone?: GitHubMilestone | null }> {
		return this.request<GitHubIssue & { milestone?: GitHubMilestone | null }>(`/repos/${owner}/${repo}/issues/${issueNumber}`)
	}

	async updateIssue(
		owner: string,
		repo: string,
		issueNumber: number,
		data: Partial<{ title: string; body: string; state: 'open' | 'closed'; milestone: number; assignees: string[]; labels: string[] }>
	): Promise<GitHubIssue> {
		return this.request<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
			method: 'PATCH',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(data)
		})
	}

	async getLabels(owner: string, repo: string): Promise<GitHubLabel[]> {
		return this.request<GitHubLabel[]>(`/repos/${owner}/${repo}/labels`)
	}

	async createLabel(owner: string, repo: string, label: { name: string; color?: string; description?: string }): Promise<GitHubLabel> {
		return this.request<GitHubLabel>(`/repos/${owner}/${repo}/labels`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(label)
		})
	}

	async listAssignees(owner: string, repo: string): Promise<GitHubUserSummary[]> {
		return this.request<GitHubUserSummary[]>(`/repos/${owner}/${repo}/assignees`)
	}

	async addAssignees(
		owner: string,
		repo: string,
		issueNumber: number,
		assignees: string[]
	): Promise<{ assignees: GitHubUserSummary[] }> {
		return this.request<{ assignees: GitHubUserSummary[] }>(`/repos/${owner}/${repo}/issues/${issueNumber}/assignees`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({assignees})
		})
	}

	async getMilestones(owner: string, repo: string): Promise<GitHubMilestone[]> {
		return this.request<GitHubMilestone[]>(`/repos/${owner}/${repo}/milestones`)
	}

	async createMilestone(
		owner: string,
		repo: string,
		milestone: { title: string; description?: string; due_on?: string }
	): Promise<GitHubMilestone> {
		return this.request<GitHubMilestone>(`/repos/${owner}/${repo}/milestones`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(milestone)
		})
	}

	// PR methods
	async createPullRequest(
		owner: string,
		repo: string,
		data: {
      title: string
      head: string
      base: string
      body?: string
      draft?: boolean
    }
	): Promise<GitHubPR> {
		return this.request<GitHubPR>(`/repos/${owner}/${repo}/pulls`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
	}

	async updatePullRequest(
		owner: string,
		repo: string,
		prNumber: number,
		data: {
      title?: string
      body?: string
      state?: 'open' | 'closed'
      draft?: boolean
    }
	): Promise<GitHubPR> {
		return this.request<GitHubPR>(`/repos/${owner}/${repo}/pulls/${prNumber}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
	}

	// Utility methods
	isAuthenticated(): boolean {
		return !!this.accessToken || !!this.appToken
	}

	setAccessToken(token: string): void {
		this.accessToken = token
		this.appToken = null // Clear app token when using OAuth token
	}
}

// Server-side helper to create client with app token
export const createGitHubClientWithAppToken = (appToken: string): GitHubAPIClient => {
	return new GitHubAPIClient('', appToken)
}

// Singleton instance for client-side usage
let githubClient: GitHubAPIClient | null = null

export const getGitHubClient = (): GitHubAPIClient => {
	if (!githubClient) {
		githubClient = new GitHubAPIClient()
	}
	return githubClient
}

// Server-side helper to create client with token
export const createGitHubClient = (accessToken: string): GitHubAPIClient => {
	return new GitHubAPIClient(accessToken)
}
