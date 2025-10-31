import {cn} from '@/lib/utils'
import {markdownToHtml} from '@/lib/markdown'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {Check, Copy, FileText, Pencil} from 'lucide-react'
import {useState} from 'react'

interface PRDescriptionProps {
	content: string
	onChange: (content: string) => void
}

export const PRDescription = ({content, onChange}: PRDescriptionProps) => {
	const [isPreview, setIsPreview] = useState(true)
	const [copied, setCopied] = useState(false)

	const copyToClipboard = () => {
		navigator.clipboard.writeText(content)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className="relative">
			<div className="absolute right-4 top-4 flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					onClick={() => setIsPreview(!isPreview)}
					className="h-8 w-8"
					title={isPreview ? 'Switch to editor' : 'Switch to preview'}
				>
					{isPreview ? (
						<Pencil className="h-4 w-4" />
					) : (
						<FileText className="h-4 w-4" />
					)}
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={copyToClipboard}
					className="h-8 w-8"
				>
					{copied ? (
						<Check className="h-4 w-4 text-green-500" />
					) : (
						<Copy className="h-4 w-4" />
					)}
				</Button>
			</div>
			<div
				className={cn(
					'rounded-lg border border-neutral-200 dark:border-neutral-800',
					'bg-neutral-50 dark:bg-neutral-900 transition-colors',
					'hover:border-neutral-300 dark:hover:border-neutral-700'
				)}
			>
				{isPreview ? (
					<div
						className={cn(
							'prose prose-neutral dark:prose-invert max-w-none',
							'p-4 min-h-[480px]',
							'prose-headings:mt-3 prose-headings:mb-2',
							'prose-p:my-2 prose-p:leading-relaxed',
							'prose-pre:my-2 prose-pre:p-2',
							'prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-800',
							'prose-code:text-neutral-700 dark:prose-code:text-neutral-200',
							'prose-a:text-blue-600 dark:prose-a:text-blue-400',
							'prose-ul:my-2 prose-li:my-0',
							'prose-sm'
						)}
						dangerouslySetInnerHTML={{
							__html: markdownToHtml(content)
						}}
					/>
				) : (
					<Textarea
						value={content}
						onChange={e => onChange(e.target.value)}
						className={cn(
							'min-h-[480px] p-4 font-mono text-sm',
							'bg-transparent resize-none',
							'border-0 focus-visible:ring-0',
							'text-neutral-900 dark:text-neutral-100'
						)}
						placeholder="Generated PR description will appear here..."
					/>
				)}
			</div>
		</div>
	)
}
