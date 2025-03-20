'use client'

import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {countries} from '@/lib/constants'
import Image from 'next/image'
import {UseFormReturn} from 'react-hook-form'

interface CountrySelectProps {
  form: UseFormReturn<any>
  name: string
  label?: string
  disabled?: boolean
  placeholder?: string
}

const CountrySelect = ({
	form,
	name,
	label = 'Country',
	disabled = false,
	placeholder = 'Select country'
}: CountrySelectProps) => {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({field}) => (
				<FormItem>
					<FormLabel className="text-foreground">{label}</FormLabel>
					<Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
						<FormControl>
							<SelectTrigger className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0">
								<SelectValue placeholder={placeholder}>
									{field.value && (
										<span className="flex items-center">
											<Image
												src={countries.find(c => c.code === field.value)?.flag || ''}
												width={64}
												height={64}
												alt={`The flag of ${countries.find(c => c.code === field.value)?.name}`}
												className="mr-2 w-6"
											/>
											{countries.find(c => c.code === field.value)?.name || field.value}
										</span>
									)}
								</SelectValue>
							</SelectTrigger>
						</FormControl>
						<SelectContent className="max-h-[300px]">
							{countries.map(country => (
								<SelectItem
									key={country.code}
									value={country.code}
									className="flex items-center"
								>
									<Image
										src={country.flag}
										width={64}
										height={64}
										alt={`The flag of ${country.name}`}
										className="mr-2 w-6"
									/>
									{country.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage className="text-xs" />
				</FormItem>
			)}
		/>
	)
}

export default CountrySelect
