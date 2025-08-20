'use client'

import {useEffect, useRef, useState} from 'react'
import {UserInfoMutation, UserInfoMutationSchema} from '@/lib/user-info/types'
import {cn, sanitizeHtml} from '@/lib/utils'
import {zodResolver} from '@hookform/resolvers/zod'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import EditorHeader from '@/components/resume/editors/shared/EditorHeader'
import TextFormField from '@/components/resume/editors/shared/TextFormField'
import RichTextFormField from '@/components/resume/editors/shared/RichTextFormField'
import FormButtons from '@/components/resume/editors/shared/FormButtons'
import ItemCard from '@/components/resume/editors/shared/ItemCard'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import DatePicker from '@/components/ui/date-picker'
import {userInfoQueryOptions, useUserInfoQuery} from '@/lib/user-info/queries'
import {Calendar, Edit2Icon, FileText, Globe, Mail, MapPin, Phone, User} from 'lucide-react'
import {useUser} from '@clerk/nextjs'
import {Button} from '@/components/ui/button'
import Image from 'next/image'
import {toast} from 'sonner'
import {useUpdateUserInfoMutation} from '@/lib/user-info/mutations'
import {useQueryClient} from '@tanstack/react-query'
import {CountryDropdown} from '@/components/ui/country-dropdown'
import ScrollMask from '@/components/ui/scroll-mask'
import {baseResumeQueryOptions} from '@/lib/resume/queries'
import PersonalDetailsEditorSkeleton from '@/components/skeletons/PersonalDetailsEditorSkeleton'
import {AnimatePresence, motion} from 'motion/react'
import {
	ANIMATE_PRESENCE_MODE,
	DEFAULT_FADE_ANIMATION,
	DEFAULT_FADE_CONTENT_ANIMATION,
	NO_ANIMATION
} from '@/components/animations/DefaultFade'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'

interface Props {
  className?: string;
  isTabSwitch?: boolean;
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
	country: 'IND',
	nationality: '',
	postal: '',
	profile_text: '',
	website: ''
}

const SALUTATIONS = ['Mr.', 'Ms.', 'Mrs.', 'Miss', 'Dr.', 'Prof.', 'Rev.', 'Hon.', 'Mx.']

const PersonalDetailsEditor: React.FC<Props> = ({className, isTabSwitch = false}) => {
	const scrollRef = useRef<HTMLDivElement>(null)
	const [view, setView] = useState<ViewState>('list')
	const [isMounted, setIsMounted] = useState(false)
	const queryClient = useQueryClient()
	const {user: clerkUser} = useUser()
	const {scrollToItem, clearHighlight} = useResumeHighlight()

	const revalidate = () => {
		queryClient.invalidateQueries({queryKey: userInfoQueryOptions.queryKey})
		queryClient.invalidateQueries({queryKey: baseResumeQueryOptions.queryKey})
	}

	const {data: userInfo, isLoading, isError, error} = useUserInfoQuery()
	const {mutateAsync: updateInfo, isPending: isUpdatingPending} = useUpdateUserInfoMutation(
		{
			onMutate: async (newData: UserInfoMutation) => {
				await queryClient.cancelQueries({queryKey: userInfoQueryOptions.queryKey})
				await queryClient.cancelQueries({queryKey: baseResumeQueryOptions.queryKey})

				const previousUserData = queryClient.getQueryData(userInfoQueryOptions.queryKey)
				const previousResumeData = queryClient.getQueryData(baseResumeQueryOptions.queryKey)

				// Update user info cache
				queryClient.setQueryData(userInfoQueryOptions.queryKey, (oldData: any) => ({
					...oldData,
					...newData
				}))

				// Update resume cache to reflect personal info changes
				queryClient.setQueryData(baseResumeQueryOptions.queryKey, (oldData: any) => ({
					...oldData,
					user: {
						...oldData?.user,
						...newData
					}
				}))

				return {previousUserData, previousResumeData}
			},
			onError: (err, newData, context:any) => {
				if (context?.previousUserData) {
					queryClient.setQueryData(userInfoQueryOptions.queryKey, context.previousUserData)
				}
				if (context?.previousResumeData) {
					queryClient.setQueryData(baseResumeQueryOptions.queryKey, context.previousResumeData)
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
		defaultValues: userInfo ? {
			...userInfo,
			country: userInfo.country?.code || null
		} : DEFAULT_DETAILS_VALUES
	})

	const isSubmitting = isUpdatingPending

	const onSubmit = async (values: UserInfoMutation) => {
		await updateInfo(values)
		setView('list')
		clearHighlight()
	}

	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Reset form when userInfo data is loaded
	useEffect(() => {
		if (userInfo) {
			// Convert country object to string for form compatibility
			const formData = {
				...userInfo,
				country: userInfo.country?.code || null
			}
			form.reset(formData)
		}
	}, [userInfo, form])

	const handleUpdate = () => {
		if (userInfo) {
			// Convert country object to string for form compatibility
			const formData = {
				...userInfo,
				country: userInfo.country?.code || null
			}
			form.reset(formData)
		}
		// Reset scroll position when transitioning to form view
		if (scrollRef.current) {
			scrollRef.current.scrollTop = 0
		}
		setView('form')

		// Trigger highlight for personal info section
		scrollToItem({
			type: 'personal'
		})
	}

	const handleCancel = () => {
		if (userInfo) {
			// Convert country object to string for form compatibility
			const formData = {
				...userInfo,
				country: userInfo.country?.code || null
			}
			form.reset(formData)
		} else {
			form.reset(DEFAULT_DETAILS_VALUES)
		}
		// Reset scroll position when transitioning to list view
		if (scrollRef.current) {
			scrollRef.current.scrollTop = 0
		}
		setView('list')
		clearHighlight()
	}

	return (
		<div ref={scrollRef} className={cn('space-y-6', className)}>
			{view === 'form' ? (
				<ScrollMask
					className="space-y-6"
					style={{
						height: 'calc(100vh - 162px)'
					}}
					data-lenis-prevent
				>
					<div className="space-y-6 px-1">
						<EditorHeader
							title="Update Personal Information"
							description="Ensure that the details are correct and reflect your previous personal information"
						/>

						<div className="rounded-xl p-6 mb-6 shadow-md bg-neutral-100">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<div className="w-10 h-10 bg-flame-500 rounded-lg flex items-center justify-center">
										<FileText className="h-5 w-5 text-white" />
									</div>
								</div>
								<div className="flex-1">
									<h3 className="text-base font-semibold text-flame-950 leading-none mb-1">Global Information</h3>
									<p className="text-sm text-flame-900 leading-relaxed">
										Changes made to your personal information will be applied across all of your resumes.
										This ensures your details stay consistent throughout your profile.
									</p>
								</div>
							</div>
						</div>

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
														<SelectTrigger className="h-12">
															<SelectValue placeholder="e.g., Mr., Mrs., Dr." />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{SALUTATIONS.map(salutation => (
															<SelectItem key={salutation} value={salutation}>{salutation}</SelectItem>
														))}
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
										placeholder="e.g. Smith"
										disabled={isSubmitting}
									/>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<TextFormField
										form={form}
										name="email"
										label="Email"
										placeholder="e.g. john.smith@email.com"
										disabled={isSubmitting}
									/>

									<TextFormField
										form={form}
										name="phone"
										label="Phone Number"
										placeholder="e.g. +1 (555) 123-4567"
										disabled={isSubmitting}
									/>

									<DatePicker form={form} label="Date of birth" name="dob" />
								</div>

								<TextFormField
									form={form}
									name="website"
									label="Website"
									placeholder="e.g. https://johnsmith.dev"
									disabled={isSubmitting}
								/>

								<RichTextFormField
									form={form}
									name="profile_text"
									label="Bio"
									placeholder="Write a brief professional summary highlighting your key skills, experience, and career goals..."
									disabled={isSubmitting}
									editorClassName="h-32"
								/>

								<hr className="my-3" />

								<TextFormField
									form={form}
									name="address"
									label="Address"
									placeholder="e.g. 123 Main Street, Apartment 4B"
									disabled={isSubmitting}
								/>

								<div className="grid grid-cols-3 gap-4">
									<TextFormField
										form={form}
										name="city"
										label="City"
										placeholder="e.g. New York"
										disabled={isSubmitting}
									/>

									<TextFormField
										form={form}
										name="postal"
										label="Postal code"
										placeholder="e.g. 10001"
										disabled={isSubmitting}
									/>

									<div className="">
										<FormField
											disabled={isSubmitting}
											control={form.control}
											name="country"
											render={({field}) => (
												<FormItem className="w-full">
													<FormLabel className="text-foreground">Country</FormLabel>

													<CountryDropdown
														key={field.value || 'default'}
														placeholder="Select country"
														defaultValue={field.value || 'IND'}
														onChange={({ioc, name}) => {
															field.onChange(ioc)
														}}
													/>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<FormButtons
									onCancel={handleCancel}
									isSubmitting={isSubmitting}
									isEditing={view === 'form'}
									editingSubmitLabel="Update Personal Info"
								/>
							</form>
						</Form>
					</div>
				</ScrollMask>
			) : (
				<>
					<EditorHeader
						title="Personal Information"
						showAddButton={isMounted && !isLoading}
						onAddNew={handleUpdate}
						addButtonText="Update your personal info"
					/>

					<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
						{isLoading && (
							<motion.div
								key="skeleton"
								{...DEFAULT_FADE_ANIMATION}
							>
								<PersonalDetailsEditorSkeleton />
							</motion.div>
						)}

						{error && (
							<motion.div
								key="error"
								{...DEFAULT_FADE_ANIMATION}
								className="text-center py-10 text-red-500"
							>
								Error loading personal details. Please try again later.
							</motion.div>
						)}

						{!isLoading && !error && (
							<motion.div
								key="content"
								{...(isTabSwitch ? NO_ANIMATION : DEFAULT_FADE_CONTENT_ANIMATION)}
								className="space-y-4"
							>
								{userInfo ? (
									<ItemCard
										onEdit={handleUpdate}
										id={userInfo.id}
									>
										<div className="space-y-6 p-4">
											{/* Header Section */}
											<div className="flex items-center space-x-3">
												<div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full overflow-hidden">
													{clerkUser?.hasImage && clerkUser.imageUrl && clerkUser.imageUrl.length > 0 ? (
														<Image
															src={clerkUser.imageUrl}
															alt={`${clerkUser.firstName || 'User'}'s profile`}
															width={48}
															height={48}
															className="w-full h-full object-cover"
															priority={false}
															unoptimized={false}
														/>
													) : (
														<User className="w-6 h-6 text-primary" />
													)}
												</div>
												<div>
													<h3 className="text-lg font-semibold text-foreground">
														{userInfo?.title && `${userInfo.title} `}
														{userInfo.first_name} {userInfo.last_name}
													</h3>
													<p className="text-sm text-muted-foreground">Personal Information</p>
												</div>
											</div>

											{/* Contact Information */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{/* Email */}
												<div className="flex items-center space-x-3">
													<div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg mb-1">
														<Mail className="w-4 h-4 text-flame-600" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
														<p className="text-sm text-foreground truncate">{userInfo.email || 'Not provided'}</p>
													</div>
												</div>

												{/* Phone */}
												<div className="flex items-center space-x-3">
													<div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg mb-1">
														<Phone className="w-4 h-4 text-flame-600" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
														<p className="text-sm text-foreground">{userInfo.phone || 'Not provided'}</p>
													</div>
												</div>

												{/* Date of Birth */}
												<div className="flex items-center space-x-3">
													<div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg mb-1">
														<Calendar className="w-4 h-4 text-flame-600" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Birth</p>
														<p className="text-sm text-foreground">
															{userInfo.dob ? userInfo.dob.toLocaleDateString() : 'Not provided'}
														</p>
													</div>
												</div>

												{/* Website */}
												<div className="flex items-center space-x-3">
													<div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg mb-1">
														<Globe className="w-4 h-4 text-flame-600" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Website</p>
														<p className="text-sm text-foreground truncate">{userInfo.website || 'Not provided'}</p>
													</div>
												</div>
											</div>

											{/* Address Section */}
											{(userInfo.address || userInfo.city || userInfo.postal || userInfo.country?.name) && (
												<div className="flex items-start space-x-3">
													<div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg my-1">
														<MapPin className="w-4 h-4 text-flame-600" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Address</p>
														<div className="text-sm text-foreground space-y-1">
															{userInfo.address && <p>{userInfo.address}</p>}
															<p>
																{[userInfo.city, userInfo.postal, userInfo.country?.name]
																	.filter(Boolean)
																	.join(', ') || 'Not provided'}
															</p>
														</div>
													</div>
												</div>
											)}

											{/* Bio Section */}
											{userInfo.profile_text && (
												<div className="flex items-start space-x-3">
													<div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg mt-1">
														<FileText className="w-4 h-4 text-flame-600" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Professional Summary</p>
														<div
															className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none"
															dangerouslySetInnerHTML={{__html: sanitizeHtml(userInfo.profile_text)}}
														/>
													</div>
												</div>
											)}
										</div>
									</ItemCard>
								) : (
									<Button onClick={handleUpdate} className="w-full" variant="outline">
										<Edit2Icon className="h-4 w-4 mr-2" />
										Edit Personal Details
									</Button>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</>
			)}
		</div>
	)
}

export default PersonalDetailsEditor
