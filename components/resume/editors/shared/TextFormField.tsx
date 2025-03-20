'use client'

import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form'
import {BrandedInput as Input} from '@/components/ui/input'
import {UseFormReturn} from 'react-hook-form'

interface TextFormFieldProps {
  form: UseFormReturn<any>
  name: string
  label: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

const TextFormField = ({
	form,
	name,
	label,
	placeholder = '',
	disabled = false,
	className
}: TextFormFieldProps) => {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({field}) => (
				<FormItem className={className}>
					<FormLabel className="text-foreground">{label}</FormLabel>
					<FormControl>
						<Input
							{...field}
							value={field.value || ''}
							placeholder={placeholder}
							className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
							disabled={disabled}
						/>
					</FormControl>
					<FormMessage className="text-xs" />
				</FormItem>
			)}
		/>
	)
}

export default TextFormField
