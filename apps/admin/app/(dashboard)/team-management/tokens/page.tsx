'use client'

import {useMutation, useQuery} from 'convex/react'
import {api} from '@/convex/_generated/api'
import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import {toast} from 'sonner'
import type {Doc} from '@/convex/_generated/dataModel'
import {getCookie} from 'cookies-next'
import {LinearClient} from '@linear/sdk'

const ApiTokensPage = () => {
	const [viewerId, setViewerId] = useState<string | null>(null)
	const [viewerEmail, setViewerEmail] = useState<string | undefined>(undefined)
	const [viewerName, setViewerName] = useState<string | undefined>(undefined)

	useEffect(() => {
		const loadViewer = async () => {
			try {
				const token = getCookie('linear_access_token')
				if (!token) return
				const linear = new LinearClient({accessToken: token.toString()})
				const me = await linear.viewer
				setViewerId(me.id)
				setViewerEmail(me.email ?? undefined)
				setViewerName(me.name ?? undefined)
			} catch {}
		}
		loadViewer()
	}, [])

	const tokens = (useQuery(api.apiTokens.listTokens, viewerId ? {createdByUserId: viewerId} : 'skip') as Doc<'apiTokens'>[] | undefined) ?? []
	const createToken = useMutation(api.apiTokens.createToken)
	const revokeToken = useMutation(api.apiTokens.revokeToken)
	const [label, setLabel] = useState('')
	const [newToken, setNewToken] = useState<string | null>(null)
	const [isCreating, setIsCreating] = useState(false)

	const onCreate = async () => {
		if (!label.trim()) {
			toast.error('Enter a label for the token')
			return
		}
		setIsCreating(true)
		try {
			if (!viewerId) {
				toast.error('Unable to identify current user')
				return
			}
			const res = await createToken({label: label.trim(), createdByUserId: viewerId, createdByUserEmail: viewerEmail, createdByUserName: viewerName})
			setNewToken(res.token as string)
			setLabel('')
			toast.success('Token created. Copy it now; you won\'t see it again.')
		} catch (e) {
			toast.error('Failed to create token')
		} finally {
			setIsCreating(false)
		}
	}

	const onRevoke = async (id: string) => {
		try {
			await revokeToken({id: id as unknown as Doc<'apiTokens'>['_id']})
			toast.success('Token revoked')
		} catch {
			toast.error('Failed to revoke token')
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">API Tokens</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Create Token</CardTitle>
				</CardHeader>
				<CardContent className="flex gap-2">
					<Input
						placeholder="Token label (e.g., Raycast)"
						value={label}
						onChange={(e) => setLabel(e.target.value)}
					/>
					<Button onClick={onCreate} disabled={isCreating}>Create</Button>
				</CardContent>
				{newToken && (
					<CardContent>
						<div className="space-y-3 text-sm">
							<div className="text-destructive font-medium">
								This token will be shown only once. Copy and store it securely.
							</div>
							<div className="flex items-start gap-2">
								<pre className="p-2 bg-muted rounded break-all flex-1">{newToken}</pre>
								<Button
									variant="secondary"
									onClick={async () => {
										try {
											await navigator.clipboard.writeText(newToken)
											toast.success('Token copied to clipboard')
										} catch {
											toast.error('Failed to copy token')
										}
									}}
								>
									Copy
								</Button>
							</div>
						</div>
					</CardContent>
				)}
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Existing Tokens</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Label</TableHead>
									<TableHead>Active</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Last Used</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{tokens.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
											No tokens yet
										</TableCell>
									</TableRow>
								) : (
									tokens.map((t: Doc<'apiTokens'>) => (
										<TableRow key={t._id}>
											<TableCell>{t.label}</TableCell>
											<TableCell>{t.isActive ? 'Yes' : 'No'}</TableCell>
											<TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
											<TableCell>{t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString() : '—'}</TableCell>
											<TableCell className="text-right">
												<Button variant="destructive" size="sm" onClick={() => onRevoke(t._id)} disabled={!t.isActive}>
													Revoke
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default ApiTokensPage
