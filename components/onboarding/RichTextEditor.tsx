'use client'

import {useEditor, EditorContent} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import UnderlineExtension from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import {Button} from '@/components/ui/button'
import {
	Bold,
	Italic,
	Underline,
	List,
	ListOrdered,
	Link as LinkIcon
} from 'lucide-react'
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover'
import {Input, InputProps} from '@/components/ui/input'
import {cn} from '@/lib/utils'


const RichTextEditor: React.FC<Omit<InputProps, 'onChange'> & { onChange?: (value: string) => void }> = ({value = '<p></p>', onChange, className = '', placeholder = 'Start typing ...'}) => {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: false,
				orderedList: false,
				listItem: false
			}),
			Link.configure({openOnClick: false,
				HTMLAttributes: {
					class: 'underline text-blue-500 hover:text-blue-700'
				}
			}),
			UnderlineExtension,
			BulletList.configure({
				HTMLAttributes: {
					class: 'list-disc pl-5'
				}
			}),
			OrderedList.configure({
				HTMLAttributes: {
					class: 'list-decimal pl-5'
				}
			}),
			ListItem
		],
		content: value as string,
		onUpdate: ({editor}) => {
			onChange && onChange(editor.getHTML())
		}
	})

	if (!editor) {
		return null
	}

	return (
		<div className={cn('border rounded-md p-4', className)}>
			<div className="flex gap-2 mb-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={!editor.can().chain().focus().toggleBold().run()}
					className={editor.isActive('bold') ? 'bg-muted' : ''}
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={!editor.can().chain().focus().toggleItalic().run()}
					className={editor.isActive('italic') ? 'bg-muted' : ''}
				>
					<Italic className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					disabled={!editor.can().chain().focus().toggleUnderline().run()}
					className={editor.isActive('underline') ? 'bg-muted' : ''}
				>
					<Underline className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					disabled={!editor.can().chain().focus().toggleBulletList().run()}
					className={editor.isActive('bulletList') ? 'bg-muted' : ''}
				>
					<List className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					disabled={!editor.can().chain().focus().toggleOrderedList().run()}
					className={editor.isActive('orderedList') ? 'bg-muted' : ''}
				>
					<ListOrdered className="h-4 w-4" />
				</Button>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							disabled={!editor.can().chain().focus().setLink({href: ''}).run()}
							className={editor.isActive('link') ? 'bg-muted' : ''}
						>
							<LinkIcon className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80">
						<div className="flex flex-col gap-4">
							<h4 className="font-medium leading-none">Insert Link</h4>
							<Input
								id="link"
								placeholder="https://example.com"
								className="col-span-3"
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault()
										editor.chain().focus().setLink({href: e.currentTarget.value}).run()
									}
								}}
							/>
						</div>
					</PopoverContent>
				</Popover>
			</div>
			<EditorContent
				editor={editor} placeholder={placeholder} className="border rounded-md" />
		</div>
	)
}

export default RichTextEditor
