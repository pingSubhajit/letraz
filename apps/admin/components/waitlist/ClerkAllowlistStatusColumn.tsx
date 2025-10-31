'use client'

import {useEffect, useState} from 'react'
import {Badge} from '@/components/ui/badge'
import {Check, Loader2, X} from 'lucide-react'
import {checkEmailInClerkAllowlist} from '@/lib/actions/clerkAllowlistActions'

interface ClerkAllowlistStatusColumnProps {
  email: string
  hasAccess: boolean
}

const ClerkAllowlistStatusColumn = ({email, hasAccess}: ClerkAllowlistStatusColumnProps) => {
	const [status, setStatus] = useState<{
	loading: boolean
	inAllowlist: boolean | null
	error: string | null
}>({loading: true, inAllowlist: null, error: null})

	useEffect(() => {
		const checkStatus = async () => {
			if (!hasAccess) {
				setStatus({loading: false, inAllowlist: false, error: null})
				return
			}

			try {
				const result = await checkEmailInClerkAllowlist(email)
				setStatus({
					loading: false,
					inAllowlist: result.success ? result.inAllowlist : false,
					error: result.error || null
				})
			} catch (error) {
				setStatus({
					loading: false,
					inAllowlist: false,
					error: error instanceof Error ? error.message : 'Unknown error'
				})
			}
		}

		checkStatus()
	}, [email, hasAccess])

	if (status.loading) {
		return (
			<div className="flex items-center space-x-2">
				<Loader2 className="h-3 w-3 animate-spin" />
				<span className="text-xs text-muted-foreground">Checking...</span>
			</div>
		)
	}

	if (status.error) {
		return (
			<Badge variant="destructive" className="text-xs">
				<X className="h-3 w-3 mr-1" />
				Error
			</Badge>
		)
	}

	if (!hasAccess) {
		return (
			<Badge variant="secondary" className="text-xs">
				N/A
			</Badge>
		)
	}

	return (
		<Badge variant={status.inAllowlist ? 'success' : 'destructive'} className="text-xs">
			{status.inAllowlist ? (
				<>
					<Check className="h-3 w-3 mr-1" />
					In Allowlist
				</>
			) : (
				<>
					<X className="h-3 w-3 mr-1" />
					Not in Allowlist
				</>
			)}
		</Badge>
	)
}

export default ClerkAllowlistStatusColumn
