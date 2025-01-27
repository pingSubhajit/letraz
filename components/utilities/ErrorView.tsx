'use client'

import Image from 'next/image'
import errorBanner from '@/public/error_banner.svg'
import {Button} from '@/components/ui/button'
import {motion} from 'motion/react'
import {cn} from '@/lib/utils'

type Props = {
	title?: string
	description?: string
	errorId?: string
	buttonText?: string
	buttonFn?: () => void
	className?: string
}

const ErrorView = ({title, description, buttonText, buttonFn, className}: Props) => {
	const reloadFn = () => window.location.reload()

	return (
		<motion.div
			className={cn('absolute top-1/2 left-1/2 -translate-x-[48%] -translate-y-1/2 flex flex-col justify-center items-center max-w-md gap-4', className)}>
			<Image
				priority
				src={errorBanner}
				alt="A visually appealing banner signifying an error has occured"
			/>
			<h1 className="mt-2 text-center font-bold text-red-600 text-lg">{title || 'An unexpected error happened'}</h1>
			<p className="text-sm text-center px-8">
				{description || 'That\'s on us. We\'ve taken a note of this issue and working on a fix. Sorry for the inconvenience.'}
			</p>

			<Button
				variant="secondary"
				className="w-[70%]"
				onClick={buttonFn ?? reloadFn}
			>
				{buttonText || 'Reload'}
			</Button>
		</motion.div>
	)
}

export default ErrorView
