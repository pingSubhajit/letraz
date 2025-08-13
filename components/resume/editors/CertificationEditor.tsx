'use client'

import {useEffect, useState} from 'react'
import {useParams} from 'next/navigation'
import {apiDateToDate, cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Plus} from 'lucide-react'
import {useAutoAnimate} from '@formkit/auto-animate/react'
import {Certification, CertificationMutation, CertificationMutationSchema} from '@/lib/certification/types'
import {useQueryClient} from '@tanstack/react-query'
import {toast} from 'sonner'
import {certificationOptions, useCurrentCertifications} from '@/lib/certification/queries'
import {baseResumeQueryOptions} from '@/lib/resume/queries'
import {
	useAddCertificationMutation,
	useDeleteCertificationMutation,
	useUpdateCertificationMutation
} from '@/lib/certification/mutations'
import EditorHeader from '@/components/resume/editors/shared/EditorHeader'
import TextFormField from '@/components/resume/editors/shared/TextFormField'
import FormButtons from '@/components/resume/editors/shared/FormButtons'
import ItemCard from '@/components/resume/editors/shared/ItemCard'
import CertificationEditorSkeleton from '@/components/skeletons/CertificationEditorSkeleton'
import {AnimatePresence, motion} from 'motion/react'
import {
	ANIMATE_PRESENCE_MODE,
	DEFAULT_FADE_ANIMATION,
	DEFAULT_FADE_CONTENT_ANIMATION,
	NO_ANIMATION
} from '@/components/animations/DefaultFade'
import {Input} from '@/components/ui/input'
import DatePicker from '@/components/ui/date-picker'
import {useResumeHighlight} from '@/components/resume/contexts/ResumeHighlightContext'
import {useAutoFocusField} from '@/components/resume/hooks/useAutoFocus'


const DEFAULT_CERTIFICATION_VALUES: CertificationMutation = {
	name: '',
	issuing_organization: undefined,
	issue_date: undefined,
	credential_url: ''
}

type ViewState = 'list' | 'form'

interface CertificationEditorProps {
  className?: string
  isTabSwitch?: boolean
}

const CertificationEditor = ({className, isTabSwitch = false}: CertificationEditorProps) => {
	const [isMounted, setIsMounted] = useState(false)
	const params = useParams<{ resumeId?: string }>()
	const resumeId = (params?.resumeId as string) ?? 'base'
	const [view, setView] = useState<ViewState>('list')
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [parent] = useAutoAnimate()

	const queryClient = useQueryClient()
	const {scrollToItem, clearHighlight} = useResumeHighlight()

	// Auto-focus the first field when form is opened
	useAutoFocusField(view === 'form', 'name')

	const revalidate = () => {
		queryClient.invalidateQueries({queryKey: certificationOptions(resumeId).queryKey})
		queryClient.invalidateQueries({queryKey: baseResumeQueryOptions.queryKey})
	}

	const form = useForm<CertificationMutation>({
		resolver: zodResolver(CertificationMutationSchema),
		defaultValues: DEFAULT_CERTIFICATION_VALUES,
		mode: 'onChange'
	})

	const {data: certifications = [], isLoading, error} = useCurrentCertifications()

	const {mutateAsync: addCertification, isPending: isAdding} = useAddCertificationMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Certification added successfully!')
		},
		onError: () => {
			toast.error('Failed to add certification. Please try again.')
		}
	})

	const {mutateAsync: updateCertification, isPending: isUpdating} = useUpdateCertificationMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Certification updated successfully!')
		},
		onError: () => {
			toast.error('Failed to update certification. Please try again.')
		}
	})

	const {mutateAsync: deleteCertification, isPending: isDeleting} = useDeleteCertificationMutation({
		onSuccess: () => {
			revalidate()
			toast.success('Certification deleted successfully!')
		},
		onError: () => {
			toast.error('Failed to delete certification. Please try again.')
		}
	})

	const isSubmitting = isAdding || isUpdating

	useEffect(() => {
		setIsMounted(true)
	}, [])


	const renderCertificationItem = (certification: Certification, index: number) => (
		<ItemCard
			key={certification.id}
			onEdit={() => handleEdit(index)}
			onDelete={() => handleDelete(certification.id)}
			isDeleting={isDeleting}
			id={certification.id}
			deletingId={deletingId}
		>
			<h3 className="font-medium">
				{certification.name}
			</h3>
			<p className="text-sm text-muted-foreground">
				{certification.issuing_organization}
			</p>
			{certification.issue_date && (
				<p className="text-sm">
					<span className="font-medium">Issued at:</span> {new Date(certification.issue_date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long'
					})}
				</p>
			)}
			{certification.credential_url && (
				<span className="text-sm">
					<span className="font-medium">Verification link:</span> <a className="text-flame-600 truncate" href={certification.credential_url} target="_blank">
						{certification.credential_url}
					</a>
				</span>
			)}
		</ItemCard>
	)

	const onSubmit = async (values: CertificationMutation) => {
		try {
			if (editingIndex !== null) {
				const certificationId = certifications[editingIndex]?.id
				await updateCertification({id: certificationId, data: values})
			} else {
				await addCertification({data: values, resumeId})
			}

			form.reset(DEFAULT_CERTIFICATION_VALUES)
			setView('list')
			setEditingIndex(null)
			clearHighlight()
		} catch (error) {
			// Error already handled by the mutation's onError callback
		}
	}

	const handleEdit = (index: number) => {
		const certification = certifications[index]
		form.reset({
			name: certification.name,
			issuing_organization: certification.issuing_organization || undefined,
			issue_date: certification.issue_date ? apiDateToDate(certification.issue_date) || undefined : undefined,
			credential_url: certification.credential_url || ''
		})
		setEditingIndex(index)
		setView('form')

		// Trigger highlight for this certification item
		scrollToItem({
			type: 'certification',
			id: certification.id
		})
	}

	const handleDelete = async (id: string) => {
		try {
			setDeletingId(id)
			await deleteCertification({id, resumeId})
			if (editingIndex !== null && certifications[editingIndex]?.id === id) {
				setEditingIndex(null)
				form.reset(DEFAULT_CERTIFICATION_VALUES)
				setView('list')
				clearHighlight()
			}
		} catch (error) {
			// Error already handled by the mutation's onError callback
		} finally {
			setDeletingId(null)
		}
	}

	const handleAddNew = () => {
		form.reset(DEFAULT_CERTIFICATION_VALUES)
		setEditingIndex(null)
		setView('form')
	}

	const handleCancel = () => {
		form.reset(DEFAULT_CERTIFICATION_VALUES)
		setEditingIndex(null)
		setView('list')
		clearHighlight()
	}

	if (view === 'form') {
		return (
			<div className={cn('space-y-6', className)}>
				<EditorHeader
					title={editingIndex !== null ? 'Update Certification' : 'Add New Certification'}
					description={editingIndex !== null
						? 'Ensure that the details are correct and reflect your professional certifications'
						: 'Adding professional certifications can significantly enhance your resume and demonstrate your expertise'
					}
					className="mb-10"
				/>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
						<TextFormField
							form={form}
							name="name"
							label="Certification Name"
							placeholder="e.g. AWS Certified Solutions Architect"
							disabled={isSubmitting}
						/>

						<TextFormField
							form={form}
							name="issuing_organization"
							label="Issuing Organization"
							placeholder="e.g. Amazon Web Services"
							disabled={isSubmitting}
						/>

						<DatePicker
							form={form}
							label="Issue Date"
							name="issue_date"
							disabled={isSubmitting}
						/>

						<FormField
							control={form.control}
							name="credential_url"
							render={({field}) => (
								<FormItem>
									<FormLabel className="text-foreground">Credential URL</FormLabel>
									<FormControl>
										<Input
											type="url"
											placeholder="https://www.example.com/credential"
											disabled={isSubmitting}
											{...field}
											value={field.value || ''}
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>

						<FormButtons
							onCancel={handleCancel}
							isSubmitting={isSubmitting}
							isEditing={editingIndex !== null}
							editingSubmitLabel="Update Certification"
							addingSubmitLabel="Add Certification"
						/>
					</form>
				</Form>
			</div>
		)
	}

	return (
		<div className={cn('space-y-6', className)}>
			<EditorHeader
				title="Certifications"
				showAddButton={isMounted && !isLoading}
				onAddNew={handleAddNew}
				isDisabled={isDeleting}
				addButtonText="Add New Certification"
			/>

			<AnimatePresence mode={ANIMATE_PRESENCE_MODE}>
				{isLoading && (
					<motion.div
						key="skeleton"
						{...DEFAULT_FADE_ANIMATION}
					>
						<CertificationEditorSkeleton />
					</motion.div>
				)}

				{error && (
					<motion.div
						key="error"
						{...DEFAULT_FADE_ANIMATION}
						className="text-center py-10 text-red-500"
					>
						Error loading certifications. Please try again later.
					</motion.div>
				)}

				{!isLoading && !error && (
					<motion.div
						key="content"
						{...(isTabSwitch ? NO_ANIMATION : DEFAULT_FADE_CONTENT_ANIMATION)}
					>
						{certifications.length > 0 ? (
							<div className="space-y-4" ref={parent}>
								{certifications.map((certification, index) => renderCertificationItem(certification, index))}
							</div>
						) : (
							<Button
								onClick={handleAddNew}
								className="w-full"
								variant="outline"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add New Certification
							</Button>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default CertificationEditor
