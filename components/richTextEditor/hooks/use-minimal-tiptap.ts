import * as React from 'react'
import type {Editor, Extensions} from '@tiptap/core'
import type {Content, UseEditorOptions} from '@tiptap/react'
import {useEditor} from '@tiptap/react'
import {StarterKit} from '@tiptap/starter-kit'

import {Placeholder} from '@tiptap/extension-placeholder'
import {Underline} from '@tiptap/extension-underline'
import {TextStyle} from '@tiptap/extension-text-style'
import {Link} from '@/components/richTextEditor/extensions/link'
import {cn} from '@/lib/utils'
import {getOutput} from '@/components/richTextEditor/utils'
import {useThrottle} from '@/components/richTextEditor/hooks/use-throttle'


export interface UseMinimalTiptapEditorProps extends UseEditorOptions {
  value?: Content
  output?: 'html' | 'json' | 'text'
  placeholder?: string
  editorClassName?: string
  throttleDelay?: number
  onUpdate?: (content: Content) => void
  onBlur?: (content: Content) => void
}

const createExtensions = (placeholder: string) :Extensions => [
	StarterKit.configure({
		horizontalRule: false,
		codeBlock: false,
		paragraph: {HTMLAttributes: {class: 'text-node'}},
		heading: {HTMLAttributes: {class: 'heading-node'}},
		blockquote: {HTMLAttributes: {class: 'block-node'}},
		bulletList: {HTMLAttributes: {class: 'list-node'}},
		orderedList: {HTMLAttributes: {class: 'list-node'}},
		code: {HTMLAttributes: {class: 'inline', spellcheck: 'false'}},
		dropcursor: {width: 2, class: 'ProseMirror-dropcursor border'}
	}),
	Link,
	TextStyle,
	Placeholder.configure({placeholder: () => placeholder}),
	Underline
]

export const useMinimalTiptapEditor = ({
	value,
	output = 'html',
	placeholder = '',
	editorClassName,
	throttleDelay = 0,
	onUpdate,
	onBlur,
	...props
}: UseMinimalTiptapEditorProps) => {
	const throttledSetValue = useThrottle(
		(value: Content) => onUpdate?.(value),
		throttleDelay
	)

	const handleUpdate = React.useCallback(
		(editor: Editor) => throttledSetValue(getOutput(editor, output)),
		[output, throttledSetValue]
	)

	const handleCreate = React.useCallback(
		(editor: Editor) => {
			if (value && editor.isEmpty) {
				editor.commands.setContent(value)
			}
		},
		[value]
	)

	const handleBlur = React.useCallback(
		(editor: Editor) => onBlur?.(getOutput(editor, output)),
		[output, onBlur]
	)

	return useEditor({
		extensions: createExtensions(placeholder),
		editorProps: {
			attributes: {
				autocomplete: 'off',
				autocorrect: 'off',
				autocapitalize: 'off',
				class: cn('focus:outline-none', editorClassName)
			}
		},
		immediatelyRender: false, // Prevents the editor from rendering on initialization (useful for SSR)
		onUpdate: ({editor}) => handleUpdate(editor),
		onCreate: ({editor}) => handleCreate(editor),
		onBlur: ({editor}) => handleBlur(editor),
		...props
	})
}

export default useMinimalTiptapEditor
