'use client'

import {useEffect, useState} from 'react'
import {
	UserInfoMutation,
	UserInfoMutationSchema
} from '@/lib/user-info/types'
import {cn} from '@/lib/utils'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {zodResolver} from '@hookform/resolvers/zod'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form'
import {DevTool} from '@hookform/devtools'

import {useForm} from 'react-hook-form'

import {countries} from '@/lib/constants'
import EditorHeader from '@/components/resume/editors/shared/EditorHeader'
import DateRangeFields from '@/components/resume/editors/shared/DateRangeFields'
import CountrySelect from '@/components/resume/editors/shared/CountrySelect'
import TextFormField from '@/components/resume/editors/shared/TextFormField'
import RichTextFormField from '@/components/resume/editors/shared/RichTextFormField'
import FormButtons from '@/components/resume/editors/shared/FormButtons'
import ItemCard from '@/components/resume/editors/shared/ItemCard'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import DatePicker from '@/components/ui/date-picker'
import {userInfoQueryOptions, useUserInfoQuery} from '@/lib/user-info/queries'
import {Edit2Icon, Loader2, PlusIcon} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {toast} from 'sonner'
import {Input} from '@/components/ui/input'
import {useUpdateUserInfoMutation} from '@/lib/user-info/mutations'
import {useQueryClient} from '@tanstack/react-query'
import {CountryDropdown} from '@/components/ui/country-dropdown'

interface Props {
  className?: string;
}

type ViewState = 'list' | 'form';

const DEFAULT_DETAILS_VALUES: UserInfoMutation = {
	title: '',
	first_name: '',
	last_name: '',
	email: '',
	phone: '',
	dob: new Date(),
	address: '',
	city: '',
	country: {
		code: 'IN',
		name: 'India'
	},
	nationality: '',
	postal: '',
	profile_text: '',
	website: ''
}

const PersonalDetailsEditor: React.FC<Props> = ({className}) => {
	const [parent] = useAutoAnimate()
	const [view, setView] = useState<ViewState>('list')
	const [isMounted, setIsMounted] = useState(false)
	const queryClient = useQueryClient()

	const [editingIndex, setEditingIndex] = useState<number | null>(null)

	const revalidate = () => {
		queryClient.invalidateQueries({queryKey: userInfoQueryOptions.queryKey})

	}

	const {data: userInfo, isLoading, isError, error} = useUserInfoQuery()
	const {mutateAsync: updateInfo, isPending: isUpdatingPending} = useUpdateUserInfoMutation(
		{
			onMutate: async (newData: UserInfoMutation) => {
				await queryClient.cancelQueries({queryKey: userInfoQueryOptions.queryKey})

				const previousData = queryClient.getQueryData(userInfoQueryOptions.queryKey)

				queryClient.setQueryData(userInfoQueryOptions.queryKey, (oldData: any) => ({
					...oldData,
					...newData
				}))

				return {previousData}
			},
			onError: (err, newData, context:any) => {
				if (context?.previousData) {
					queryClient.setQueryData(userInfoQueryOptions.queryKey, context.previousData)
				}
				toast.error('Failed to update personal details. Please try again.')
			},
			onSettled: () => {
				revalidate()
			}
		}
	)

	const form = useForm<UserInfoMutation>({
		resolver: zodResolver(UserInfoMutationSchema),
		defaultValues:
			userInfo || DEFAULT_DETAILS_VALUES
	})

	// const isSubmitting = false
	const isSubmitting = isUpdatingPending

	const onSubmit = async (values: UserInfoMutation) => {
		// console.log(values)

		try {
			await updateInfo(values)
		} catch (error) {
			// Error already handled by the mutation's onError callback
		}
	}

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const handleAddNew = () => {
		form.reset(userInfo || DEFAULT_DETAILS_VALUES)
		setEditingIndex(null)
		setView('form')
	}

	const handleCancel = () => {
		form.reset(userInfo || DEFAULT_DETAILS_VALUES)
		setEditingIndex(null)
		setView('list')
	}

	if (view === 'form') {
		return (
			<div className={cn('space-y-6', className)}>
				<EditorHeader
					title={
						editingIndex !== null
							? 'Update Personal Information'
							: 'Add New Personal Information'
					}
					description={
						editingIndex !== null
							? 'Ensure that the details are correct and reflect your previous personal information'
							: // TODO change text message
							'Mentioning your past employment details can increase the chance of your résumé getting selected upto 75%'
					}
					className="mb-10"
				/>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4"
					>
						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="title"
								render={({field}) => (
									<FormItem>
										<FormLabel className="text-foreground">Title</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value as string}
											disabled={isSubmitting}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="e.g., Mr., Mrs., Dr." />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={'mr'}>Mr.</SelectItem>
												<SelectItem value={'dr'}>Dr.</SelectItem>
												<SelectItem value={'mrs'}>Mrs.</SelectItem>
												{/* <SelectItem value={'mrs'}>
													Mrs
												</SelectItem> */}
											</SelectContent>
										</Select>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
							<TextFormField
								form={form}
								name="first_name"
								label="First Name"
								placeholder="e.g. John"
								disabled={isSubmitting}
							/>
							<TextFormField
								form={form}
								name="last_name"
								label="Last Name"
								placeholder="e.g. Doe"
								disabled={isSubmitting}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<TextFormField
								form={form}
								name="email"
								label="Email"
								// TODO place holder can be change
								placeholder="Enter your email"
								disabled={isSubmitting}
							/>
							<TextFormField
								form={form}
								name="phone"
								label="Phone Number"
								placeholder="Enter your phone number"
								disabled={isSubmitting}
							/>
						</div>

						{/* can be replace  */}
						<div className="grid grid-cols-2 gap-4">
							<DatePicker form={form} label="Date of birth" name="dob" />
							<FormField
								disabled={isSubmitting}
								control={form.control}
								name="country"
								render={() => (
									<FormItem className="w-full">
										<FormLabel className="text-foreground">Country</FormLabel>

										<CountryDropdown
											placeholder="Select country"
											defaultValue="IND"
											onChange={({ioc, name}) => {
												form.setValue('country.code', ioc)
												form.setValue('country.name', name)
											}}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<TextFormField
							form={form}
							name="address"
							label="Address"
							placeholder="Enter your address"
							disabled={isSubmitting}
						/>
						<TextFormField
							form={form}
							name="city"
							label="City"
							placeholder="Enter your city"
							disabled={isSubmitting}
						/>
						{/* <TextFormField
							form={form}
							name="postal"
							label="Postal code"
							placeholder="Enter your postal"
							disabled={isSubmitting}
						/> */}
						<TextFormField
							form={form}
							name="postal"
							label="Postal code"
							placeholder="Enter your postal"
							disabled={isSubmitting}
						/>
						<TextFormField
							form={form}
							name="website"
							label="Website"
							placeholder="Enter your website"
							disabled={isSubmitting}
						/>

						<TextFormField
							form={form}
							name="profileText"
							label="Bio"
							placeholder="Enter your bio"
							disabled={isSubmitting}
						/>

						{/* <FormField
							control={form.control}
							name="first_name"
							render={({field}) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input placeholder="shadcn" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							type="submit"
						>
							Submit
						</Button> */}
						{/* <button onClick={() => {
							console.log('form', form.getValues())
						}}>click</button> */}

						<FormButtons
							onCancel={handleCancel}
							isSubmitting={isSubmitting}
							isEditing={editingIndex !== null}
							editingSubmitLabel="Update Personal Info"
							addingSubmitLabel="Add Personal Info"
						/>
					</form>
				</Form>
				<DevTool control={form.control} />
			</div>
		)
	}

	return (
		<div className={cn('space-y-6', className)}>
			<EditorHeader
				title="Person Info"
				showAddButton={isMounted && !isLoading}
				// TODO can be modified to non-delete data like personal info with only update action and update icon
				onAddNew={handleAddNew}
				// isDisabled={isDeleting}
				addButtonText="Update your personal info"
			/>

			{isLoading ? (
				<div className="flex items-center justify-center py-10">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-2">Loading personal details...</span>
				</div>
			) : error ? (
				<div className="text-center py-10 text-red-500">
					Error loading personal details. Please try again later.
				</div>
			) : (
				<div ref={parent} className="space-y-4">
					{userInfo ? (
					// TODO can be modified to non-delete data like personal info with only update action
						<ItemCard
							onEdit={() => setView('form')}
							onDelete={() => {
								toast.error('Deleting...')
							}}
							isDeleting={false}
							id={userInfo.id}
							deletingId={null}
						>
							<h3 className="font-medium">
								{userInfo?.title} {userInfo.first_name || 'N/A'}{' '}
								{userInfo.last_name || 'N/A'}
							</h3>
							<p className="text-sm text-muted-foreground">
								Email: {userInfo.email || 'N/A'} | Phone:{' '}
								{userInfo.phone || 'N/A'}
							</p>
							<p className="text-sm">
								Nationality: {userInfo.nationality || 'N/A'}
							</p>
							<p className="text-sm">
								Date of Birth:{' '}
								{userInfo.dob ? userInfo.dob.toLocaleDateString() : 'N/A'}
							</p>
							<p className="text-sm">
								{userInfo.address ||
                userInfo.city ||
                userInfo.postal ||
                userInfo.country?.name
									? `Address: ${userInfo.address || 'N/A'}, ${
										userInfo.city || 'N/A'
									}, ${userInfo.postal || 'N/A'}, ${
										userInfo.country?.name || 'N/A'
									}`
									: 'Address: N/A'}
							</p>
							<p className="text-sm">Website: {userInfo.website || 'N/A'}</p>
							<p className="text-sm">Bio: {userInfo.profile_text || 'N/A'}</p>
						</ItemCard>
					) : (
						<Button onClick={handleAddNew} className="w-full" variant="outline">
							<Edit2Icon className="h-4 w-4 mr-2" />
							Edit Personal Details
						</Button>
					)}
				</div>
			)}
		</div>
	)
}

export default PersonalDetailsEditor
