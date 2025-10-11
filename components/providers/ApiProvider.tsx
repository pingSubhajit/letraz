'use client'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false
		}
	}
})

const APIProvider = ({children}: React.PropsWithChildren) => (
	<QueryClientProvider client={queryClient}>
		{children}
	</QueryClientProvider>
)

export default APIProvider
