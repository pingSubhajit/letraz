'use client'

import {FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {countries} from '@/lib/constants'
import Image from 'next/image'
import {UseFormReturn} from 'react-hook-form'
import {useEffect, useState} from 'react'

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
	const [userCountry, setUserCountry] = useState<string | null>(null)

	// Get user's country from IP
	useEffect(() => {
		fetch('https://ipapi.co/json/')
			.then(res => res.json())
			.then(data => {
				if (data.country_code_iso3) {
					setUserCountry(data.country_code_iso3)
				}
			})
			.catch(() => {
				// Fallback to India if detection fails
				setUserCountry('IND')
			})
	}, [])

	// Set form value when country is detected and field is empty
	useEffect(() => {
		if (userCountry && !form.getValues(name)) {
			form.setValue(name, userCountry)
		}
	}, [userCountry, form, name])

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
