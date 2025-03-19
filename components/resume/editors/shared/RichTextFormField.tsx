'use client'

import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form'
import RichTextEditor from '@/components/richTextEditor'
import {UseFormReturn} from 'react-hook-form'

interface RichTextFormFieldProps {
  form: UseFormReturn<any>
  name: string
  label: string
  placeholder?: string
  disabled?: boolean
  className?: string
  height?: string
}

const RichTextFormField = ({
	form,
	name,
	label,
	placeholder = '',
	disabled = false,
	className,
	height = 'h-60'
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
							className={disabled ? `${height} mt-3 opacity-60 pointer-events-none` : `${height} mt-3`}
							placeholder={placeholder}
							editorContentClassName="flex-1 h-[200px] overflow-y-auto"
						/>
					</FormControl>
					<FormMessage className="text-xs" />
				</FormItem>
			)}
		/>
	)
}

export default RichTextFormField
