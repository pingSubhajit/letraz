import {NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {createGitHubClientWithAppToken} from '@/lib/github-api'
import {getGitHubAppClient} from '@/lib/github-app'
import {matchBranchWithLinearIssues} from '@/lib/branch-matching'
import {api} from '@/convex/_generated/api'
import {fetchMutation, fetchQuery} from 'convex/nextjs'

// GitHub webhook signature verification
const verifyWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
	const crypto = require('crypto')

	const hmac = crypto.createHmac('sha256', secret)
	const digest = 'sha256=' + hmac.update(payload).digest('hex')

	return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export const GET = async () => {
	return NextResponse.json({status: 'Webhook endpoint is active'}, {status: 200})
}

export const POST = async (request: Request) => {
	try {
		const body = await request.text()
		const headersList = await headers()
		const signature = headersList.get('x-hub-signature-256')
		const eventType = headersList.get('x-github-event')
		const deliveryId = headersList.get('x-github-delivery')

		console.log('🚀 GitHub webhook received:', {
			eventType,
			deliveryId,
			timestamp: new Date().toISOString(),
			bodyLength: body.length
		})

		if (!signature || !eventType) {
			console.error('❌ Missing required headers:', {signature: !!signature, eventType})
			return NextResponse.json({error: 'Missing required headers'}, {status: 400})
		}

		// Parse webhook payload
		let payload
		try {
			payload = JSON.parse(body)
		} catch (error) {
			console.error('❌ Failed to parse webhook payload:', error)
			return NextResponse.json({error: 'Invalid JSON payload'}, {status: 400})
		}

		// Extract repository info from payload
		const {repository} = payload
		if (!repository || !repository.id || !repository.owner?.login || !repository.name) {
			console.error('❌ Invalid repository data in payload:', {
				hasRepository: !!repository,
				hasId: !!(repository as any)?.id,
				hasOwner: !!(repository as any)?.owner?.login,
				hasName: !!(repository as any)?.name
			})
			return NextResponse.json({error: 'Invalid repository data in payload'}, {status: 400})
		}

		console.log('📋 Repository info extracted:', {
			repositoryId: repository.id,
			owner: repository.owner.login,
			name: repository.name
		})

		// Find repository in database
		const {getRepositoryByGitHubId} = api.repositories
		const repositoryData = await fetchQuery(getRepositoryByGitHubId, {
			githubId: repository.id,
			owner: repository.owner.login
		})

		if (!repositoryData) {
			console.error('❌ Repository not found in database:', {
				githubId: repository.id,
				owner: repository.owner.login
			})
			return NextResponse.json({error: 'Repository not found'}, {status: 404})
		}

		console.log('✅ Repository found in database:', {
			repositoryId: repositoryData._id,
			name: repositoryData.name,
			owner: repositoryData.owner,
			hasWebhookSecret: !!repositoryData.webhookSecret,
			hasLinearTeamId: !!repositoryData.linearTeamId
		})

		// Verify webhook signature
		const signatureValid = verifyWebhookSignature(body, signature, repositoryData.webhookSecret)
		console.log('🔐 Webhook signature verification:', {
			isValid: signatureValid,
			signatureLength: signature.length,
			secretLength: repositoryData.webhookSecret?.length || 0
		})

		if (!signatureValid) {
			console.error('❌ Invalid webhook signature')
			return NextResponse.json({error: 'Invalid signature'}, {status: 401})
		}

		// Get GitHub App installation for this repository
		const githubAppClient = getGitHubAppClient()
		console.log('🔍 Checking GitHub App installation:', {
			owner: repository.owner.login,
			repo: repository.name
		})

		const installation = await githubAppClient.getRepositoryInstallation(
			repository.owner.login,
			repository.name
		)

		if (!installation) {
			console.error('❌ GitHub App not installed on repository:', {
				owner: repository.owner.login,
				repo: repository.name
			})
			return NextResponse.json({error: 'GitHub App not installed on repository'}, {status: 403})
		}

		console.log('✅ GitHub App installation found:', {
			installationId: installation.id,
			owner: repository.owner.login,
			repo: repository.name
		})

		const installationToken = await githubAppClient.getInstallationToken(installation.id)
		console.log('🔑 Installation token obtained:', {
			tokenLength: installationToken?.length || 0,
			tokenPreview: installationToken?.substring(0, 10) + '...' || 'null'
		})

		// Create GitHub client with app token
		const githubClient = createGitHubClientWithAppToken(installationToken)
		console.log('✅ GitHub client created with app token')

		// Create webhook event record
		const {createWebhookEvent} = api.repositories
		await fetchMutation(createWebhookEvent, {
			repositoryId: repositoryData._id,
			eventType,
			payload
		})
		console.log('💾 Webhook event recorded:', {
			repositoryId: repositoryData._id,
			eventType,
			deliveryId
		})

		// Handle different event types
		console.log('🎯 Processing event type:', eventType)
		switch (eventType) {
		case 'push':
			console.log('📝 Handling push event')
			await handlePushEvent(payload, repositoryData, githubClient)
			break

		case 'ping':
			console.log('🏓 Received ping event - webhook is working')
			// GitHub sends a ping event when webhook is created
			break

		default:
			console.log('⚠️ Unhandled event type:', eventType)
		}

		console.log('✅ Webhook processing completed successfully')
		return NextResponse.json({success: true})
	} catch (error) {
		console.error('💥 Webhook processing failed:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			timestamp: new Date().toISOString()
		})
		return NextResponse.json({error: 'Internal server error'}, {status: 500})
	}
}

// Handle push events
const handlePushEvent = async (payload: any, repositoryData: any, githubClient: any) => {
	const {ref, commits, repository, sender} = payload

	console.log('📝 Processing push event:', {
		ref,
		commitCount: commits?.length || 0,
		sender: sender?.login,
		repository: `${repository?.owner?.login}/${repository?.name}`,
		created: payload.created
	})

	// Only process branch pushes (not tags)
	if (!ref.startsWith('refs/heads/')) {
		console.log('⏭️ Skipping non-branch ref:', ref)
		return
	}

	const branchName = ref.replace('refs/heads/', '')
	console.log('🌿 Processing branch:', branchName)

	// Check if this is a new branch creation
	const isNewBranch = payload.created

	if (isNewBranch) {
		console.log('🆕 New branch detected, starting PR generation workflow:', {
			branchName,
			commitCount: commits?.length || 0,
			created: payload.created
		})

		/*
		 * Process new branch - match with Linear issues and create PRs
		 */
		await processNewBranch(branchName, repositoryData, payload, githubClient)
	} else {
		console.log('⏭️ Skipping existing branch update:', {
			branchName,
			commitCount: commits?.length || 0,
			created: payload.created,
			isNewBranch
		})
	}
}

// Process new branch - match with Linear issues and create PRs
const processNewBranch = async (branchName: string, repositoryData: any, payload: any, githubClient: any) => {
	try {
		console.log('🔍 Starting branch matching process:', {
			branchName,
			repositoryId: repositoryData._id,
			repository: `${repositoryData.owner}/${repositoryData.name}`,
			linearTeamId: repositoryData.linearTeamId
		})

		// Match branch with Linear issues
		const matchResult = await matchBranchWithLinearIssues(branchName, repositoryData)

		console.log('🎯 Branch matching result:', {
			branchName,
			confidence: matchResult.confidence,
			hasMatchedIssue: !!matchResult.matchedIssue,
			linearIssueId: matchResult.linearIssueId,
			matchedIssueId: matchResult.matchedIssue?.id,
			matchedIssueTitle: matchResult.matchedIssue?.title?.substring(0, 50) + '...'
		})

		if (!matchResult.matchedIssue) {
			console.log('❌ No Linear issue matched for branch:', branchName)
			return
		}

		// Only proceed with high or medium confidence matches
		if (matchResult.confidence === 'low') {
			console.log('⚠️ Skipping low confidence match:', {
				branchName,
				confidence: matchResult.confidence,
				issueTitle: matchResult.matchedIssue.title
			})
			return
		}

		console.log('✅ High/medium confidence match found, proceeding with PR creation:', {
			branchName,
			confidence: matchResult.confidence,
			issueId: matchResult.matchedIssue.id,
			issueIdentifier: matchResult.matchedIssue.identifier,
			issueTitle: matchResult.matchedIssue.title
		})

		// Create PR for the matched issue
		await createPRForLinearIssue(matchResult, repositoryData, payload, githubClient)

	} catch (error) {
		console.error('💥 Error in processNewBranch:', {
			branchName,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		})
	}
}

// Create PR for Linear issue
const createPRForLinearIssue = async (
	matchResult: any,
	repositoryData: any,
	payload: any,
	githubClient: any
) => {
	try {
		const {repository, sender} = payload
		const {matchedIssue} = matchResult

		console.log('🚀 Starting PR creation process:', {
			repository: `${repository.owner.login}/${repository.name}`,
			branchName: matchResult.branchName,
			linearIssueId: matchedIssue.id,
			linearIssueIdentifier: matchedIssue.identifier,
			issueTitle: matchedIssue.title
		})

		/*
		 * Get default branch (usually main or master)
		 * Note: githubClient is already created with app token above
		 */

		// For now, assume main branch as default
		const defaultBranch = 'main'
		console.log('🌿 Using default branch:', defaultBranch)

		// Create PR title
		const prTitle = `${matchedIssue.identifier} | ${matchedIssue.title}`
		console.log('📝 PR title generated:', prTitle)

		// Generate PR description using existing infrastructure
		console.log('📄 Generating PR description...')
		const prDescription = await generatePRDescription(matchedIssue)
		console.log('✅ PR description generated:', {
			descriptionLength: prDescription.length,
			hasContent: !!prDescription.trim()
		})

		// Create the PR
		console.log('🔨 Creating GitHub PR...')
		const prData = await githubClient.createPullRequest(
			repository.owner.login,
			repository.name,
			{
				title: prTitle,
				head: matchResult.branchName,
				base: defaultBranch,
				body: prDescription,
				draft: true // Create as draft initially
			}
		)

		console.log('✅ PR created successfully:', {
			prNumber: prData.number,
			prId: prData.id,
			prUrl: prData.html_url,
			prTitle: prData.title,
			isDraft: prData.draft
		})

		// Record the PR mapping in database
		console.log('💾 Recording PR mapping in database...')
		const {createGitHubPrMapping} = api.repositories
		await fetchMutation(createGitHubPrMapping, {
			linearIssueId: matchedIssue.id,
			githubPrId: prData.id,
			githubRepositoryId: repositoryData._id,
			githubPrNumber: prData.number,
			githubPrUrl: prData.html_url
		})
		console.log('✅ PR mapping recorded:', {
			linearIssueId: matchedIssue.id,
			githubPrId: prData.id,
			githubRepositoryId: repositoryData._id
		})

		// Link GitHub issue if it exists and apply labels/milestones/assignee
		console.log('🔗 Applying metadata to PR...')
		await linkGitHubIssueAndApplyMetadata(prData, matchedIssue, repositoryData, githubClient)
		console.log('✅ Metadata application completed')

	} catch (error) {
		console.error('💥 Error in createPRForLinearIssue:', {
			branchName: matchResult.branchName,
			linearIssueId: matchResult.matchedIssue?.id,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		})
	}
}

// Generate PR description using existing infrastructure
const generatePRDescription = async (issue: any): Promise<string> => {
	try {
		console.log('📡 Calling PR generation API:', {
			issueId: issue.id,
			issueIdentifier: issue.identifier,
			apiUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/generate`
		})

		// Use the existing PR generation endpoint
		const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				issue: {
					id: issue.id,
					identifier: issue.identifier,
					title: issue.title,
					description: issue.description,
					url: issue.url
				},
				customInstructions: '' // Could be enhanced to include repository-specific instructions
			})
		})

		console.log('📡 PR generation API response:', {
			status: response.status,
			ok: response.ok,
			statusText: response.statusText
		})

		if (!response.ok) {
			console.error('❌ PR generation API failed:', {
				status: response.status,
				statusText: response.statusText
			})
			throw new Error('Failed to generate PR description')
		}

		const data = await response.json()
		const description = data.text || `Related to: ${issue.title}`

		console.log('✅ PR description generated successfully:', {
			descriptionLength: description.length,
			hasCustomContent: !!data.text
		})

		return description
	} catch (error) {
		console.error('💥 PR description generation failed:', {
			issueId: issue.id,
			error: error instanceof Error ? error.message : String(error)
		})

		// Fallback to basic description
		const fallbackDescription = `## Issue\n[${issue.identifier}](${issue.url})\n\n## Description\n${issue.title}`
		console.log('🔄 Using fallback PR description:', {
			fallbackLength: fallbackDescription.length
		})
		return fallbackDescription
	}
}

// Link GitHub issue and apply metadata (labels, milestones)
const linkGitHubIssueAndApplyMetadata = async (
	prData: any,
	matchedIssue: any,
	repositoryData: any,
	githubClient: any
) => {
	try {
		console.log('🔗 Starting metadata application process:', {
			prNumber: prData.number,
			linearIssueId: matchedIssue.id,
			linearIssueTitle: matchedIssue.title,
			hasLabels: !!(matchedIssue.labels && matchedIssue.labels.length > 0),
			hasAssignee: !!matchedIssue.assignee,
			hasMilestone: !!matchedIssue.milestone,
			hasGitHubIssue: !!matchedIssue.githubIssue
		})

		// Ensure repo exists; response shape not used further
		await githubClient.getRepository(repositoryData.owner, repositoryData.name)
		console.log('✅ Repository verified for metadata operations')

		// STEP 1: Check for existing GitHub-Linear mapping
		console.log('🔍 STEP 1: Checking GitHub-Linear mapping...')
		const {getGitHubIssueByLinearIssue} = api.repositories
		const githubIssueMapping = await fetchQuery(getGitHubIssueByLinearIssue, {
			linearIssueId: matchedIssue.id,
			githubRepositoryId: repositoryData._id
		})

		console.log('📊 GitHub-Linear mapping check result:', {
			hasDirectMapping: !!githubIssueMapping,
			mappingIssueId: githubIssueMapping?.githubIssueId,
			hasLinearGitHubIssue: !!matchedIssue.githubIssue
		})

		// Check if Linear issue has GitHub integration data
		if (matchedIssue.githubIssue) {
			const sourceOwner = matchedIssue.githubIssue.owner || repositoryData.owner
			const sourceRepo = matchedIssue.githubIssue.repo || repositoryData.name

			console.log('🔗 Found GitHub issue in Linear integration:', {
				sourceOwner,
				sourceRepo,
				issueNumber: matchedIssue.githubIssue.number,
				isCrossRepo: sourceOwner !== repositoryData.owner || sourceRepo !== repositoryData.name
			})

			// If issue repo differs from PR repo, link cross-repo using closing keyword reference (won't auto-close across repos, but links UI)
			if (sourceOwner !== repositoryData.owner || sourceRepo !== repositoryData.name) {
				console.log('🌐 Cross-repository linking detected, adding reference...')
				const updatedBody = `${prData.body}\n\nFixes ${sourceOwner}/${sourceRepo}#${matchedIssue.githubIssue.number}`
				await githubClient.updatePullRequest(
					repositoryData.owner,
					repositoryData.name,
					prData.number,
					{body: updatedBody}
				)
				console.log('✅ Cross-repository reference added to PR body')

				// Try to mirror milestone by name from the source issue
				try {
					const appClient = getGitHubAppClient()
					const sourceOctokit = await appClient.getClientForRepo(sourceOwner, sourceRepo)
					if (sourceOctokit) {
						const {data: issue} = await sourceOctokit.issues.get({owner: sourceOwner, repo: sourceRepo, issue_number: matchedIssue.githubIssue.number})
						if (issue.milestone?.title) {
							await applyLinearMilestoneToPR(
								repositoryData,
								prData,
								{id: '', name: issue.milestone.title},
								githubClient
							)
						}

						// Add a back-reference comment on the source issue to ensure a visible link
						try {
							const prUrl = prData.html_url
							await sourceOctokit.issues.createComment({
								owner: sourceOwner,
								repo: sourceRepo,
								issue_number: matchedIssue.githubIssue.number,
								body: `Linked PR: ${prUrl}`
							})
						} catch {}
					}
				} catch {}
			} else {
				// Same-repo flow
				await linkIssueToPR(
					repositoryData,
					prData,
					matchedIssue.githubIssue.number,
					githubClient
				)

				try {
					const sourceIssue = await githubClient.getIssue(
						repositoryData.owner,
						repositoryData.name,
						matchedIssue.githubIssue.number
					)
					if (sourceIssue.milestone) {
						await githubClient.updateIssue(
							repositoryData.owner,
							repositoryData.name,
							prData.number,
							{milestone: sourceIssue.milestone.number}
						)
					}
				} catch {}
			}
		} else if (githubIssueMapping) {
			console.log('🔗 Found database mapping, linking GitHub issue to PR:', {
				githubIssueId: githubIssueMapping.githubIssueId
			})

			// Link the GitHub issue to the PR
			await linkIssueToPR(
				repositoryData,
				prData,
				githubIssueMapping.githubIssueId,
				githubClient
			)

			// Mirror milestone from the mapped GitHub issue onto the PR
			try {
				const sourceIssue = await githubClient.getIssue(
					repositoryData.owner,
					repositoryData.name,
					githubIssueMapping.githubIssueId
				)

				if (sourceIssue.milestone) {
					console.log('🏷️ Mirroring milestone from GitHub issue to PR:', {
						milestoneTitle: sourceIssue.milestone.title,
						milestoneNumber: sourceIssue.milestone.number
					})
					await githubClient.updateIssue(
						repositoryData.owner,
						repositoryData.name,
						prData.number,
						{milestone: sourceIssue.milestone.number}
					)
				} else {
					console.log('⚪ No milestone found on mapped GitHub issue')
				}
			} catch (error) {
				console.error('❌ Error mirroring milestone from GitHub issue:', error)
			}
		} else {
			console.log('ℹ️ No GitHub issue found to link to PR')
		}

		// STEP 2: Apply labels from Linear issue to GitHub PR
		if (matchedIssue.labels && matchedIssue.labels.length > 0) {
			console.log('🏷️ STEP 2: Applying labels to PR...', {
				labelCount: matchedIssue.labels.length,
				labelNames: matchedIssue.labels.map((l: any) => l.name)
			})
			await ensureAndApplyLabelsToPR(repositoryData, prData, matchedIssue.labels, githubClient)
		} else {
			console.log('⚪ STEP 2: No labels to apply from Linear issue')
		}

		// STEP 3: Try to assign PR to a matching GitHub user
		console.log('👤 STEP 3: Attempting to assign PR to matching GitHub user...')
		await tryAssignPRAssignee(repositoryData, prData, matchedIssue, githubClient)

		// STEP 4: Apply milestone from Linear issue if available
		if (matchedIssue.milestone) {
			console.log('🎯 STEP 4: Applying milestone from Linear issue to PR:', {
				milestoneName: matchedIssue.milestone.name
			})
			await applyLinearMilestoneToPR(repositoryData, prData, matchedIssue.milestone, githubClient)
		} else {
			console.log('⚪ STEP 4: No milestone to apply from Linear issue')
		}

	} catch (error) {
		console.error('💥 Error in linkGitHubIssueAndApplyMetadata:', {
			prNumber: prData?.number,
			linearIssueId: matchedIssue?.id,
			error: error instanceof Error ? error.message : String(error)
		})
	}
}

// Apply Linear milestone to PR by finding/creating matching GitHub milestone
const applyLinearMilestoneToPR = async (
	repositoryData: any,
	prData: any,
	linearMilestone: any,
	githubClient: any
) => {
	try {
		console.log('🎯 Applying Linear milestone to PR:', {
			linearMilestoneName: linearMilestone.name,
			prNumber: prData.number
		})

		// Get all GitHub milestones for the repository
		const githubMilestones = await githubClient.getMilestones(
			repositoryData.owner,
			repositoryData.name
		)

		console.log('📋 Found GitHub milestones:', {
			count: githubMilestones.length,
			milestoneNames: githubMilestones.map((m: any) => m.title)
		})

		// Look for exact match by title
		let matchingMilestone = githubMilestones.find((m: any) => m.title.toLowerCase() === linearMilestone.name.toLowerCase())

		// If not found, create it
		if (!matchingMilestone) {
			console.log('➕ Creating new GitHub milestone:', linearMilestone.name)
			try {
				matchingMilestone = await githubClient.createMilestone(
					repositoryData.owner,
					repositoryData.name,
					{title: linearMilestone.name}
				)
				console.log('✅ GitHub milestone created:', {
					id: matchingMilestone.id,
					title: matchingMilestone.title,
					number: matchingMilestone.number
				})
			} catch (error) {
				console.error('❌ Failed to create GitHub milestone:', {
					milestoneName: linearMilestone.name,
					error: error instanceof Error ? error.message : String(error)
				})
				return
			}
		} else {
			console.log('✅ Found existing GitHub milestone:', {
				id: matchingMilestone.id,
				title: matchingMilestone.title,
				number: matchingMilestone.number
			})
		}

		// Apply the milestone to the PR
		console.log('🔗 Applying milestone to PR:', {
			milestoneNumber: matchingMilestone.number,
			milestoneTitle: matchingMilestone.title,
			prNumber: prData.number
		})
		await githubClient.updateIssue(
			repositoryData.owner,
			repositoryData.name,
			prData.number,
			{milestone: matchingMilestone.number}
		)
		console.log('✅ Milestone successfully applied to PR')

	} catch (error) {
		console.error('💥 Error in applyLinearMilestoneToPR:', {
			linearMilestoneName: linearMilestone?.name,
			prNumber: prData?.number,
			error: error instanceof Error ? error.message : String(error)
		})
	}
}

// Link GitHub issue to PR
const linkIssueToPR = async (
	repositoryData: any,
	prData: any,
	githubIssueNumber: number,
	githubClient: any
) => {
	try {
		console.log('🔗 Linking GitHub issue to PR:', {
			issueNumber: githubIssueNumber,
			prNumber: prData.number
		})

		// Get the GitHub issue details
		const githubIssues = await githubClient.getRepositoryIssues(
			repositoryData.owner,
			repositoryData.name
		)

		console.log('📋 Retrieved GitHub issues:', {
			count: githubIssues.length,
			targetIssueNumber: githubIssueNumber
		})

		const githubIssue = githubIssues.find((issue: any) => issue.number === githubIssueNumber)

		if (!githubIssue) {
			console.error('❌ GitHub issue not found:', {
				targetIssueNumber: githubIssueNumber,
				availableIssues: githubIssues.map((i: any) => i.number)
			})
			return
		}

		console.log('✅ GitHub issue found:', {
			issueNumber: githubIssue.number,
			issueTitle: githubIssue.title,
			issueState: githubIssue.state
		})

		// Update PR body to reference the GitHub issue
		const updatedBody = `${prData.body}\n\nCloses #${githubIssueNumber}`
		console.log('📝 Adding issue reference to PR body:', {
			originalBodyLength: prData.body?.length || 0,
			updatedBodyLength: updatedBody.length
		})

		// Update the PR
		await githubClient.updatePullRequest(
			repositoryData.owner,
			repositoryData.name,
			prData.number,
			{
				body: updatedBody
			}
		)
		console.log('✅ GitHub issue successfully linked to PR')

	} catch (error) {
		console.error('💥 Error in linkIssueToPR:', {
			issueNumber: githubIssueNumber,
			prNumber: prData?.number,
			error: error instanceof Error ? error.message : String(error)
		})
	}
}

// Apply Linear labels to GitHub PR
const ensureAndApplyLabelsToPR = async (
	repositoryData: any,
	prData: any,
	linearLabels: any[],
	githubClient: any
) => {
	try {
		const targetLabelNames = linearLabels.map((l: any) => l.name)
		console.log('🏷️ Applying Linear labels to PR:', {
			prNumber: prData.number,
			targetLabelNames,
			labelCount: targetLabelNames.length
		})

		// Ensure labels exist; create if missing
		const existing = await githubClient.getLabels(
			repositoryData.owner,
			repositoryData.name
		)
		const existingSet = new Set(existing.map((l: any) => l.name.toLowerCase()))

		console.log('📋 Existing GitHub labels:', {
			count: existing.length,
			names: existing.map((l: any) => l.name)
		})

		const labelsToCreate = []
		for (const name of targetLabelNames) {
			if (!existingSet.has(name.toLowerCase())) {
				labelsToCreate.push(name)
				console.log('➕ Label needs to be created:', name)
				try {
					await githubClient.createLabel(
						repositoryData.owner,
						repositoryData.name,
						{name}
					)
					console.log('✅ Label created successfully:', name)
				} catch (error) {
					console.error('❌ Failed to create label:', {
						labelName: name,
						error: error instanceof Error ? error.message : String(error)
					})
				}
			} else {
				console.log('✅ Label already exists:', name)
			}
		}

		// Apply labels to PR (Issues and PRs share the same labels API)
		console.log('🔗 Applying labels to PR:', {
			prNumber: prData.number,
			labelsToApply: targetLabelNames
		})
		await githubClient.request(
			`/repos/${repositoryData.owner}/${repositoryData.name}/issues/${prData.number}/labels`,
			{
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({labels: targetLabelNames})
			}
		)
		console.log('✅ Labels successfully applied to PR')

	} catch (error) {
		console.error('💥 Error in ensureAndApplyLabelsToPR:', {
			prNumber: prData?.number,
			targetLabels: linearLabels?.map((l: any) => l.name),
			error: error instanceof Error ? error.message : String(error)
		})
	}
}

// Assign PR to a GitHub user by matching Linear assignee displayName to repository assignees
const tryAssignPRAssignee = async (
	repositoryData: any,
	prData: any,
	matchedIssue: any,
	githubClient: any
) => {
	try {
		const assigneeName: string | undefined = matchedIssue.assignee?.name

		console.log('👤 Attempting to assign PR to GitHub user:', {
			prNumber: prData.number,
			linearAssigneeName: assigneeName
		})

		if (!assigneeName) {
			console.log('⚪ No Linear assignee found, skipping assignment')
			return
		}

		const candidates = await githubClient.listAssignees(
			repositoryData.owner,
			repositoryData.name
		)

		console.log('📋 Repository assignees:', {
			count: candidates.length,
			usernames: candidates.map((u: any) => u.login)
		})

		// Match by login if name is a substring; fallback exact, case-insensitive
		const login = candidates.find((u: any) => u.login.toLowerCase() === assigneeName.toLowerCase() ||
      assigneeName.toLowerCase().includes(u.login.toLowerCase()) ||
      u.login.toLowerCase().includes(assigneeName.toLowerCase()))?.login

		if (!login) {
			console.log('❌ No matching GitHub user found for Linear assignee:', {
				linearAssigneeName: assigneeName,
				availableAssignees: candidates.map((u: any) => u.login)
			})
			return
		}

		console.log('✅ Found matching GitHub user:', {
			linearAssigneeName: assigneeName,
			githubLogin: login,
			prNumber: prData.number
		})

		await githubClient.addAssignees(
			repositoryData.owner,
			repositoryData.name,
			prData.number,
			[login]
		)
		console.log('✅ Successfully assigned PR to GitHub user:', login)
	} catch (error) {
		console.error('💥 Error in tryAssignPRAssignee:', {
			prNumber: prData?.number,
			linearAssigneeName: matchedIssue.assignee?.name,
			error: error instanceof Error ? error.message : String(error)
		})
	}
}
