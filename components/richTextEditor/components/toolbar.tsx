import {VariantProps} from 'class-variance-authority'
import {FormatAction} from '../types'
import {Editor} from '@tiptap/react'

import {
	DotsHorizontalIcon,
	FontBoldIcon,
	FontItalicIcon,
	ListBulletIcon,
	UnderlineIcon
} from '@radix-ui/react-icons'
import {toggleVariants} from '../../ui/toggle'
import ToolbarSection from './toolbar-section'
import {LinkEditPopover} from './link/link-edit-popover'

type TextStyleAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'orderedList'
  | 'bulletList';
interface TextStyle extends FormatAction {
  value: TextStyleAction;
}

const formatActions: TextStyle[] = [
	{
		value: 'bold',
		label: 'Bold',
		icon: <FontBoldIcon className="size-5" />,
		action: (editor) => editor.chain().focus().toggleBold().run(),
		isActive: (editor) => editor.isActive('bold'),
		canExecute: (editor) => editor.can().chain().focus().toggleBold().run() &&
      !editor.isActive('codeBlock'),
		shortcuts: ['mod', 'B']
	},
	{
		value: 'italic',
		label: 'Italic',
		icon: <FontItalicIcon className="size-5" />,
		action: (editor) => editor.chain().focus().toggleItalic().run(),
		isActive: (editor) => editor.isActive('italic'),
		canExecute: (editor) => editor.can().chain().focus().toggleItalic().run() &&
      !editor.isActive('codeBlock'),
		shortcuts: ['mod', 'I']
	},
	{
		value: 'underline',
		label: 'Underline',
		icon: <UnderlineIcon className="size-5" />,
		action: (editor) => editor.chain().focus().toggleUnderline().run(),
		isActive: (editor) => editor.isActive('underline'),
		canExecute: (editor) => editor.can().chain().focus().toggleUnderline().run() &&
      !editor.isActive('codeBlock'),
		shortcuts: ['mod', 'U']
	},
	{
		value: 'orderedList',
		label: 'Numbered list',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="20px"
				viewBox="0 -960 960 960"
				width="20px"
				fill="currentColor"
			>
				<path d="M144-144v-48h96v-24h-48v-48h48v-24h-96v-48h120q10.2 0 17.1 6.9 6.9 6.9 6.9 17.1v48q0 10.2-6.9 17.1-6.9 6.9-17.1 6.9 10.2 0 17.1 6.9 6.9 6.9 6.9 17.1v48q0 10.2-6.9 17.1-6.9 6.9-17.1 6.9H144Zm0-240v-96q0-10.2 6.9-17.1 6.9-6.9 17.1-6.9h72v-24h-96v-48h120q10.2 0 17.1 6.9 6.9 6.9 6.9 17.1v72q0 10.2-6.9 17.1-6.9 6.9-17.1 6.9h-72v24h96v48H144Zm48-240v-144h-48v-48h96v192h-48Zm168 384v-72h456v72H360Zm0-204v-72h456v72H360Zm0-204v-72h456v72H360Z" />
			</svg>
		),
		isActive: (editor) => editor.isActive('orderedList'),
		action: (editor) => editor.chain().focus().toggleOrderedList().run(),
		canExecute: (editor) => editor.can().chain().focus().toggleOrderedList().run(),
		shortcuts: ['mod', 'shift', '7']
	},
	{
		value: 'bulletList',
		label: 'Bullet list',
		icon: <ListBulletIcon className="size-5" />,
		isActive: (editor) => editor.isActive('bulletList'),
		action: (editor) => editor.chain().focus().toggleBulletList().run(),
		canExecute: (editor) => editor.can().chain().focus().toggleBulletList().run(),
		shortcuts: ['mod', 'shift', '8']
	}
]

interface ToolbarProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeActions?: TextStyleAction[];
  mainActionCount?: number;
}

const Toolbar: React.FC<ToolbarProps> = ({
	editor,
	activeActions,
	mainActionCount,
	size,
	variant
}) => (
	<div className="shrink-0 overflow-x-auto p-2">
		<div className="flex w-max items-center gap-1">
			<ToolbarSection
				editor={editor}
				actions={formatActions}
				activeActions={activeActions}
				mainActionCount={mainActionCount}
				dropdownIcon={<DotsHorizontalIcon className="size-5" />}
				dropdownTooltip="More formatting"
				dropdownClassName="w-8"
				size={size}
				variant={variant}
			/>
			<LinkEditPopover editor={editor} size={size} variant={variant} />
		</div>
	</div>
)


export default Toolbar
