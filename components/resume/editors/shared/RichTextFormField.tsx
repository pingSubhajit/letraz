'use client'

import {FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import RichTextEditor from '@/components/richTextEditor'
import {UseFormReturn} from 'react-hook-form'
import {cn} from '@/lib/utils'

interface RichTextFormFieldProps {
  form: UseFormReturn<any>
  name: string
  label: string
  placeholder?: string
  disabled?: boolean
  className?: string
  editorClassName?: string
}

const RichTextFormField = ({
	form,
	name,
	label,
	placeholder = '',
	disabled = false,
	className,
	editorClassName
}: RichTextFormFieldProps) => {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({field}) => (
				<FormItem className={`mt-4 flex-1 ${className || ''}`}>
					<FormLabel className="text-foreground">{label}</FormLabel>
					<FormControl>
						<RichTextEditor
							value={field.value || ''}
							onChange={field.onChange}
							className={cn('mt-3', disabled && 'opacity-60 pointer-events-none')}
							placeholder={placeholder}
							editorContentClassName={cn('h-[200px] overflow-y-auto', editorClassName)}
						/>
					</FormControl>
					<FormMessage className="text-xs" />
				</FormItem>
			)}
		/>
	)
}

export default RichTextFormField
