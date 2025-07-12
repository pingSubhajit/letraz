'use client'

import {useEffect, useState, useMemo} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Form} from '@/components/ui/form'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {Loader2, Plus} from 'lucide-react'
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
import {FormField, FormItem, FormLabel, FormControl, FormMessage} from '@/components/ui/form'
import {Input} from '@/components/ui/input'


const DEFAULT_CERTIFICATION_VALUES: CertificationMutation = {
	name: '',
	issuing_organization: '',
	issue_date: '',
	credential_url: ''
}

type ViewState = 'list' | 'form'

interface CertificationEditorProps {
	className?: string
}

const CertificationEditor = ({className}: CertificationEditorProps) => {
	const [isMounted, setIsMounted] = useState(false)
	const [view, setView] = useState<ViewState>('list')
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [localCertifications, setLocalCertifications] = useState<Certification[]>([])
	const [parent] = useAutoAnimate()

	const queryClient = useQueryClient()

	const revalidate = () => {
		queryClient.invalidateQueries({queryKey: certificationOptions.queryKey})
		queryClient.invalidateQueries({queryKey: baseResumeQueryOptions.queryKey})
	}

	const form = useForm<CertificationMutation>({
		resolver: zodResolver(CertificationMutationSchema),
		defaultValues: DEFAULT_CERTIFICATION_VALUES,
		mode: 'onChange'
	})

	const {data: certifications = [], isLoading, error} = useCurrentCertifications()

	// Create stable reference for certifications to prevent infinite re-renders
	const stableCertifications = useMemo(() => {
		console.log('🔍 [CERTIFICATION EDITOR] Creating stable certifications:', certifications)
		return certifications
	}, [JSON.stringify(certifications)])

	// Debug React Query state
	console.log('🔍 [CERTIFICATION EDITOR] React Query State:', { 
		certifications, 
		isLoading, 
		error,
		certificationsLength: certifications?.length,
		certificationsType: typeof certifications
	})

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
		console.log('🔍 [CERTIFICATION EDITOR] useEffect triggered with stableCertifications:', stableCertifications)
		console.log('🔍 [CERTIFICATION EDITOR] Previous localCertifications:', localCertifications)
		setLocalCertifications(stableCertifications)
		console.log('🔍 [CERTIFICATION EDITOR] Updated localCertifications to:', stableCertifications)
	}, [stableCertifications])

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
					Issued: {new Date(certification.issue_date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long'
					})}
				</p>
			)}
			{certification.credential_url && (
				<p className="text-sm text-blue-600 truncate">
					{certification.credential_url}
				</p>
			)}
		</ItemCard>
	)

	const onSubmit = async (values: CertificationMutation) => {
		try {
			if (editingIndex !== null) {
				const certificationId = localCertifications[editingIndex]?.id
				await updateCertification({id: certificationId, data: values})
			} else {
				await addCertification(values)
			}

			form.reset(DEFAULT_CERTIFICATION_VALUES)
			setView('list')
			setEditingIndex(null)
		} catch (error) {
			// Error already handled by the mutation's onError callback
		}
	}

	const handleEdit = (index: number) => {
		const certification = localCertifications[index]
		form.reset({
			...certification
		})
		setEditingIndex(index)
		setView('form')
	}

	const handleDelete = async (id: string) => {
		try {
			setDeletingId(id)
			await deleteCertification(id)
			if (editingIndex !== null && localCertifications[editingIndex]?.id === id) {
				setEditingIndex(null)
				form.reset(DEFAULT_CERTIFICATION_VALUES)
				setView('list')
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

						<FormField
							control={form.control}
							name="issue_date"
							render={({field}) => (
								<FormItem>
									<FormLabel className="text-foreground">Issue Date</FormLabel>
									<FormControl>
										<Input
											type="date"
											placeholder="Select issue date"
											disabled={isSubmitting}
											{...field}
											value={field.value || ''}
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
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

			{isLoading ? (
				<div className="flex items-center justify-center py-10">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<span className="ml-2">Loading certifications...</span>
				</div>
			) : error ? (
				<div className="text-center py-10 text-red-500">
					Error loading certifications. Please try again later.
				</div>
			) : (
				<div ref={parent}>
					{localCertifications.length > 0 ? (
						<div className="space-y-4">
							{localCertifications.map((certification, index) => renderCertificationItem(certification, index))}
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
				</div>
			)}
		</div>
	)
}

export default CertificationEditor
