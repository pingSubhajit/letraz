import {useState} from 'react'
import {Settings2} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog'

interface CustomInstructionsDialogProps {
	value: string
	onChange: (value: string) => void
}

const EXAMPLE_INSTRUCTIONS = [
	'Focus on security implications and potential vulnerabilities',
	'Include performance impact and optimization details',
	'Highlight breaking changes and migration steps',
	'Emphasize testing requirements and coverage'
]

export const CustomInstructionsDialog = ({value, onChange}: CustomInstructionsDialogProps) => {
	const [localValue, setLocalValue] = useState(value)
	const [open, setOpen] = useState(false)

	const handleSave = () => {
		onChange(localValue)
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-2 hover:bg-transparent transition-colors group flex items-center gap-1.5"
				>
					<Settings2 className="h-3 w-3 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
					<span className="text-xs text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
						Custom Instructions
					</span>
					{value && <InstructionsIndicator />}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl backdrop-saturate-150 border-neutral-200/80 dark:border-neutral-800/80">
				<DialogHeader>
					<DialogTitle className="text-xl font-medium">Custom Instructions</DialogTitle>
					<p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
						Customize how your PR descriptions are generated
					</p>
				</DialogHeader>
				<div className="space-y-4 pt-3">
					<InstructionsForm value={localValue} onChange={setLocalValue} />
					<ExampleInstructions />
					<DialogActions onCancel={() => setOpen(false)} onSave={handleSave} />
				</div>
			</DialogContent>
		</Dialog>
	)
}

const InstructionsIndicator = () => (
	<div className="relative flex h-1.5 w-1.5">
		<div className="absolute h-1.5 w-1.5 rounded-full bg-green-400 dark:bg-green-500 animate-pulse blur-[1px]" />
		<div className="absolute h-1.5 w-1.5 rounded-full bg-green-400/30 dark:bg-green-500/30 blur-[3px]" />
		<div className="h-1.5 w-1.5 rounded-full bg-green-400 dark:bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.5)] dark:shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
	</div>
)

const InstructionsForm = ({
	value,
	onChange
}: {
	value: string
	onChange: (value: string) => void
}) => (
	<div className="space-y-3">
		<div className="flex flex-col space-y-1.5">
			<label
				htmlFor="instructions"
				className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
			>
				Instructions
			</label>
			<p className="text-xs text-neutral-500 dark:text-neutral-400">
				Add specific requirements or focus areas for the PR description
			</p>
		</div>
		<Textarea
			id="instructions"
			placeholder="E.g., Focus on security implications, Include performance considerations, Highlight API changes..."
			value={value}
			onChange={e => onChange(e.target.value)}
			className="min-h-[180px] resize-none bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
		/>
	</div>
)

const ExampleInstructions = () => (
	<div className="rounded-lg border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/50 p-3">
		<h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
			Example Instructions
		</h4>
		<ul className="space-y-1">
			{EXAMPLE_INSTRUCTIONS.map(example => (
				<li
					key={example}
					className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5"
				>
					<span className="block h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
					{example}
				</li>
			))}
		</ul>
	</div>
)

const DialogActions = ({
	onCancel,
	onSave
}: {
	onCancel: () => void
	onSave: () => void
}) => (
	<div className="flex items-center justify-end gap-3 pt-2">
		<Button
			variant="ghost"
			onClick={onCancel}
			className="text-neutral-600 dark:text-neutral-400"
		>
			Cancel
		</Button>
		<Button variant="secondary" onClick={onSave}>
			Save Instructions
		</Button>
	</div>
)
