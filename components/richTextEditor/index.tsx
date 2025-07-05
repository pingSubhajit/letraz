'use client'

import './styles/index.css'
import {Content, EditorContent} from '@tiptap/react'
import useMinimalTiptapEditor, {UseMinimalTiptapEditorProps} from './hooks/use-minimal-tiptap'
import {MeasuredContainer} from './components/measured-container'
import {forwardRef} from 'react'
import {cn} from '@/lib/utils'
import {LinkBubbleMenu} from './components/bubble-menu/link-bubble-menu'
import Toolbar from './components/toolbar'

export interface RichTextEditorProps extends Omit<UseMinimalTiptapEditorProps, 'onUpdate'> {
    value?: Content
    onChange?: (value: Content) => void
    className?: string
    editorContentClassName?: string
  }

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
	({value, onChange, className, editorContentClassName, ...props}, ref) => {
		const editor = useMinimalTiptapEditor({
			value,
			onUpdate: onChange,
			...props
		})

		if (!editor) {
			return null
		}

		return (
			<MeasuredContainer
				as="div"
				name="editor"
				ref={ref}
				className={cn(
					'flex h-auto w-full flex-col ',
					className
				)}
			>
				<EditorContent editor={editor} className={cn('minimal-tiptap-editor', editorContentClassName)} />
				<LinkBubbleMenu editor={editor} />
				<Toolbar editor={editor} mainActionCount={7} />
			</MeasuredContainer>
		)
	}
)

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
