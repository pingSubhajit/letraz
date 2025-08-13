import {NextRequest, NextResponse} from 'next/server'
import {parseResume} from '@/lib/resume/parser'
import {ACCEPTED_MIME_TYPES, isAcceptedByName} from '@/lib/resume/accept'

export const runtime = 'nodejs'

/**
 * POST /api/resume/parse?format=proprietary|generic
 *
 * Expected form-data:
 *   - file: (File) the resume file (PDF/DOCX/RTF etc.)
 *
 * Header:
 *   - x-authentication: SELF_SECRET_KEY
 */
export const POST = async (req: NextRequest): Promise<NextResponse> => {
	try {
		const url = new URL(req.url)
		const formatParam = url.searchParams.get('format') as 'proprietary' | 'generic' | null
		const format: 'proprietary' | 'generic' = formatParam === 'generic' ? 'generic' : 'proprietary'

		// "middleware.ts" already ensures authentication via x-authentication header.

		const formData = await req.formData()
		const file = formData.get('file')

		if (!file || !(file instanceof File)) {
			return NextResponse.json({error: 'No file found in form data under key "file"'}, {status: 400})
		}

		// Basic validation: size and type (defensive, mirrors client-side accept)
		const maxBytes = 10 * 1024 * 1024 // 10MB
		if (file.size === 0) {
			return NextResponse.json({error: 'Uploaded file is empty'}, {status: 400})
		}
		if (file.size > maxBytes) {
			return NextResponse.json({error: 'File too large. Maximum allowed size is 10MB'}, {status: 400})
		}
		const mimeOk = (file.type ? (ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type) : false)
		const nameOk = isAcceptedByName((file.name ?? '').toLowerCase())
		if (!mimeOk && !nameOk) {
			return NextResponse.json({error: 'Unsupported file type. Please upload a PDF, DOC, DOCX, RTF, ODT, or TXT file'}, {status: 400})
		}

		const parsedResume = await parseResume(file, format)

		return NextResponse.json({
			data: parsedResume,
			format: format
		})
	} catch (error) {
		return NextResponse.json({error: (error as Error).message}, {status: 500})
	}
}
