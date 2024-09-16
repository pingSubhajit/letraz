'use server'

import {generateObject} from 'ai'
import {google} from '@ai-sdk/google'
import {z} from 'zod'
import {anthropic} from '@ai-sdk/anthropic'

const systemPrompt = `
You will be given a raw string of scraped content of a job listing page from a job portal. 
You need to understand the job and return the details from the job in the given structured format. 
Jobs would have a title, the name of the company, job location, maximum and minimum salary and requirements.
Jobs could also have job description, responsibilities, and benefits.
You need to parse the job details from the content and return the data in the structured format as shown below, provide an empty object if no data is found.
{
  title: string,
  company: string,
  location: string,
  salary_max: string,
  salary_min: string,
  requirements: string[],
  description: string,
  responsibilities: string[],
  benefits: string[],
}
`

type Job = {
	title: string,
	company: string,
	location: string,
	salary_max: string,
	salary_min: string,
	requirements: string[],
	description: string,
	responsibilities: string[],
	benefits: string[]
}

export const parseJobFromRawJD = async (input: string): Promise<Job> => {
	const models = [
		google('models/gemini-1.5-flash-latest'),
		google('models/gemini-1.0-pro-latest'),
		google('models/gemini-1.5-pro-latest'),
		anthropic('claude-3-haiku-20240307')
	]

	try {
		const parsedResult = await generateObject({
			model: models[3],
			system: systemPrompt,
			prompt: JSON.stringify(input),
			schema: z.object({
				title: z.string().describe('Title of the job'),
				company: z.string().describe('Name of the company'),
				location: z.string().describe('Location of the job'),
				salary_max: z.string().describe('Maximum salary of the job. Include currency symbol'),
				salary_min: z.string().describe('Minimum salary of the job. Include currency symbol'),
				requirements: z.array(z.string()).describe('Requirements of the job'),
				description: z.string().describe('Description of the job'),
				responsibilities: z.array(z.string()).describe('Responsibilities of the job'),
				benefits: z.array(z.string()).describe('Benefits of the job')
			})
		})

		return parsedResult.object
	} catch (error) {
		console.log(error)
		throw new Error('Failed to parse words from the input string')
	}
}
