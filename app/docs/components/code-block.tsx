'use client'

import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Check, Copy} from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  caption?: string
}

export const CodeBlock = ({code, language = 'text', filename, caption}: CodeBlockProps) => {
	const [copied, setCopied] = useState(false)

	const copyToClipboard = async () => {
		await navigator.clipboard.writeText(code)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className="group relative my-6 overflow-hidden rounded-lg border bg-gray-950 text-gray-50">
			{/* Header */}
			{(filename || language) && (
				<div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
					<div className="flex items-center gap-2">
						{filename && (
							<span className="text-sm font-mono text-gray-300">{filename}</span>
						)}
						{language && (
							<Badge variant="secondary" className="text-xs">
								{language}
							</Badge>
						)}
					</div>
					<Button
						size="sm"
						variant="ghost"
						onClick={copyToClipboard}
						className="h-7 px-2 text-gray-400 opacity-0 transition-opacity hover:text-gray-200 group-hover:opacity-100"
					>
						{copied ? (
							<Check className="h-3 w-3" />
						) : (
							<Copy className="h-3 w-3" />
						)}
						<span className="sr-only">Copy code</span>
					</Button>
				</div>
			)}

			{/* Code */}
			<div className="overflow-x-auto">
				<pre className="p-4">
					<code className="text-sm font-mono leading-relaxed text-gray-100">
						{code}
					</code>
				</pre>
			</div>

			{/* Caption */}
			{caption && (
				<div className="border-t border-gray-800 px-4 py-2">
					<p className="text-xs text-gray-400">{caption}</p>
				</div>
			)}
		</div>
	)
}
