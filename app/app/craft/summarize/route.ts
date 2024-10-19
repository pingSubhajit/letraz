import {streamText} from 'ai'
import {model} from '@/config'

const systemPrompts = {
	jd: `
You will given JS object that contains the details of a specific job post. 
That object will have details about the job including job title, location, salary, requirements, responsibilities, benefits and more. 
Your job is to very briefly summarize the job and return the output in a semantic HTML format.
`
}

export const POST = async (request: Request) => {
	const {prompt}: { prompt: string } = await request.json()

	const result = await streamText({
		model,
		system: systemPrompts.jd,
		prompt
	})

	return result.toDataStreamResponse()
}
