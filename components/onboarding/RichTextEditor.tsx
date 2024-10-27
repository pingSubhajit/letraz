'use client'

import {EditorContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import UnderlineExtension from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Placeholder from '@tiptap/extension-placeholder'
import {Button} from '@/components/ui/button'
import {motion} from 'framer-motion'
import {Bold, Italic, Link as LinkIcon, List, ListOrdered, Underline} from 'lucide-react'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {Input, InputProps} from '@/components/ui/input'
import {cn} from '@/lib/utils'
import {OnboardingFormInput} from './OnboardingFormInput'
import {useCallback, useState} from 'react'
import {useFormField} from '../ui/form'
import {ScrollArea} from '../ui/scroll-area'

const RichTextEditor: React.FC<
	Omit<InputProps, 'onChange'> & { onChange?: (value: string) => void }
> = ({
	value = '<p></p>',
	onChange,
	className = '',
	placeholder = 'Start typing ...',
	...props
}) => {
	const [fieldState, setFieldState] = useState<'idle' | 'hover' | 'focus' | 'error'>('idle')

	const {error} = useFormField()

	const handleFieldStateChange = useCallback((newState: typeof fieldState) => {
		setFieldState((prevState) => {
			if (newState === 'focus' || prevState === 'focus') return newState
			return prevState === 'idle' ? newState : prevState
		})
	}, [])

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: false,
				orderedList: false,
				listItem: false
			}),
			Link.configure({
				openOnClick: false,
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
			ListItem,
			Placeholder.configure({
				placeholder,
				emptyEditorClass: 'before:content-[attr(data-placeholder)] before:float-left ' +
				'before:text-muted-foreground before:h-0 before:pointer-events-none text-3xl font-bold ' +
				'italic px-0 py-2 h-auto'
			})
		],
		editorProps: {
			attributes: {
				class: 'text-3xl font-bold italic px-0 py-2 h-auto border-0 ring-0 border-b-2 ' +
				'outline-none min-h-40 ring-offset-background'
			}
		},
		content: value as string,
		onUpdate: ({editor}) => {
			onChange?.(editor.getHTML())
		}
	})

	if (!editor) {
		return <OnboardingFormInput placeholder={placeholder} {...props} />
	}

	const EditorButtons = [
		{
			icon: Bold,
			action: () => editor.chain().focus().toggleBold().run(),
			isActive: editor.isActive('bold')
		},
		{
			icon: Italic,
			action: () => editor.chain().focus().toggleItalic().run(),
			isActive: editor.isActive('italic')
		},
		{
			icon: Underline,
			action: () => editor.chain().focus().toggleUnderline().run(),
			isActive: editor.isActive('underline')
		},
		{
			icon: List,
			action: () => editor.chain().focus().toggleBulletList().run(),
			isActive: editor.isActive('bulletList')
		},
		{
			icon: ListOrdered,
			action: () => editor.chain().focus().toggleOrderedList().run(),
			isActive: editor.isActive('orderedList')
		}
	]

	return (
		<>
			<ScrollArea className="w-full h-full max-h-52">
				<div className={cn('relative mb-2', className)}>
					<EditorContent
						editor={editor}
						onFocus={() => handleFieldStateChange('focus')}
						onBlur={() => handleFieldStateChange('idle')}
						onMouseEnter={() => handleFieldStateChange('hover')}
						onMouseLeave={() => handleFieldStateChange('idle')}
						className="min-h-40"
					/>
					<motion.div
						initial={{width: 0}}
						animate={{
							width:
                			fieldState === 'focus'
                				? '100%'
                				: fieldState === 'hover'
                					? '50%'
                					: 0
						}}
						className="absolute w-0 h-[1px] inset-x-0 bottom-0 bg-primary origin-left"
					/>

					<motion.div
						initial={{width: 0}}
						animate={{width: error ? '100%' : 0}}
						className="absolute w-0 h-[1px] inset-x-0 bottom-0 bg-red-500 origin-left"
					/>
				</div>
			</ScrollArea>

			<div className="flex gap-2">
				{EditorButtons.map(({icon: Icon, action, isActive}, index) => (
					<Button
						key={index}
						type="button"
						variant={isActive ? 'default' : 'ghost'}
						size="icon"
						onClick={action}
						disabled={!editor.can().chain().focus().run()}
					>
						<Icon className="h-4 w-4" />
					</Button>
				))}
				<Popover>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="ghost"
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
										editor
											.chain()
											.focus()
											.setLink({href: e.currentTarget.value})
											.run()
									}
								}}
							/>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</>
	)
}

export default RichTextEditor
