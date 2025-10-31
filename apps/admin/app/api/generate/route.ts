import {generateText} from 'ai'
import {Issue} from '@linear/sdk'
import {createOpenAI} from '@ai-sdk/openai'


export const POST = async (req: Request) => {
	try {
		const openai = createOpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			compatibility: 'strict'
		})
		const body = await req.json()
		const {issue, customInstructions} = body as {
			issue: Issue
			customInstructions?: string
		}

		if (!issue) {
			return Response.json(
				{error: 'Issue data is required'},
				{status: 400}
			)
		}


		const customInstructionsPrompt = customInstructions
			? `\n\nAdditional Instructions:\n${customInstructions}\n\nMake sure to incorporate these instructions while maintaining the template structure.`
			: ''

		const {text} = await generateText({
			model: openai('gpt-3.5-turbo'),
			system:
				'You are a senior software engineer writing pull request descriptions. You write clear, concise, and technically accurate descriptions.',
			prompt: `Generate a pull request description for the following Linear issue:

Issue Title: ${issue.title}
Issue ID: ${issue.identifier}
Issue URL: ${issue.url}
Issue Description: ${issue.description}

Please follow this exact template:

### Issue:
[${issue.identifier} | ${issue.title}](${issue.url})

### Description:
[Generate a brief, clear description of what the PR is about based on the issue title]

### Changes Made:
[Generate 3-5 specific, clear bullet points about likely changes based on the issue title]

### Closing Note:
[Generate a brief conclusion about why this PR is important]

Make the description professional, clear and concise. Focus on technical accuracy and clarity.${customInstructionsPrompt}`
		})

		if (!text) {
			return Response.json(
				{error: 'Failed to generate description'},
				{status: 500}
			)
		}

		return Response.json({text})
	} catch (error) {
		// console.error('Error generating PR description:', error)
		return Response.json(
			{error: 'Failed to process request'},
			{status: 500}
		)
	}
}
