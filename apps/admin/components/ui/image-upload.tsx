'use client'

import {useEffect, useRef, useState} from 'react'
import {useMutation, useQuery} from 'convex/react'
import {api} from '@/convex/_generated/api'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Loader2, Upload, User, X} from 'lucide-react'
import {toast} from 'sonner'

interface ImageUploadProps {
  value?: string; // Current image URL or storage ID
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const ImageUpload = ({
	value,
	onChange,
	disabled = false,
	label = 'Photo',
	className = ''
}: ImageUploadProps) => {
	const [isUploading, setIsUploading] = useState(false)
	const [previewUrl, setPreviewUrl] = useState<string | undefined>()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const generateUploadUrl = useMutation(api.files.generateUploadUrl)

	// Get the actual URL if value is a storage ID
	const storageUrl = useQuery(
		api.files.getFileUrl,
		value && !value.startsWith('http') && !value.startsWith('blob:')
			? {storageId: value as any}
			: 'skip'
	)

	// Update preview URL when value or storageUrl changes
	useEffect(() => {
		if (!value) {
			setPreviewUrl(undefined)
		} else if (value.startsWith('http') || value.startsWith('blob:')) {
			// It's already a URL
			setPreviewUrl(value)
		} else if (storageUrl) {
			// It's a storage ID and we got the URL
			setPreviewUrl(storageUrl)
		}
	}, [value, storageUrl])

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file')
			return
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image size should be less than 5MB')
			return
		}

		setIsUploading(true)

		try {
			// Get upload URL from Convex
			const uploadUrl = await generateUploadUrl()

			// Upload file to Convex storage
			const result = await fetch(uploadUrl, {
				method: 'POST',
				headers: {'Content-Type': file.type},
				body: file
			})

			if (!result.ok) {
				throw new Error('Failed to upload image')
			}

			const {storageId} = await result.json()

			// Create preview URL
			const objectUrl = URL.createObjectURL(file)
			setPreviewUrl(objectUrl)

			// Return the storage ID to parent component
			onChange(storageId)
			toast.success('Image uploaded successfully')
		} catch (error) {
			toast.error('Failed to upload image')
		} finally {
			setIsUploading(false)
		}
	}

	const handleRemove = () => {
		if (previewUrl && previewUrl.startsWith('blob:')) {
			URL.revokeObjectURL(previewUrl)
		}
		setPreviewUrl(undefined)
		onChange(undefined)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const triggerFileInput = () => {
		fileInputRef.current?.click()
	}

	return (
		<div className={`space-y-2 ${className}`}>
			<Label>{label}</Label>

			{/* Hidden file input */}
			<Input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				disabled={disabled || isUploading}
				className="hidden"
			/>

			{/* Upload area */}
			<div className="flex items-center space-x-4">
				{/* Preview or placeholder */}
				<div className="flex-shrink-0">
					{previewUrl ? (
						<div className="relative w-16 h-16 rounded-full overflow-hidden border">
							<img
								src={previewUrl}
								alt="Preview"
								className="w-full h-full object-cover"
							/>
							{!disabled && (
								<button
									type="button"
									onClick={handleRemove}
									className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
								>
									<X className="w-3 h-3"/>
								</button>
							)}
						</div>
					) : (
						<div
							className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted">
							<User className="w-6 h-6 text-muted-foreground"/>
						</div>
					)}
				</div>

				{/* Upload button */}
				<div className="flex-1">
					<Button
						type="button"
						variant="outline"
						onClick={triggerFileInput}
						disabled={disabled || isUploading}
						className="w-full"
					>
						{isUploading ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin"/>
								Uploading...
							</>
						) : (
							<>
								<Upload className="w-4 h-4 mr-2"/>
								{previewUrl ? 'Change Photo' : 'Upload Photo'}
							</>
						)}
					</Button>
					<p className="text-xs text-muted-foreground mt-1">
						Max 5MB. PNG, JPG, GIF supported.
					</p>
				</div>
			</div>
		</div>
	)
}
