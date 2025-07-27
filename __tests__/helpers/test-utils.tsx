import React from 'react'
import {render, RenderOptions, RenderResult} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {TooltipProvider} from '@/components/ui/tooltip'
import {SidebarProvider} from '@/components/providers/SidebarProvider'

// Create a custom render function that includes common providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Options for customizing the test environment
  withQueryClient?: boolean
  withTooltipProvider?: boolean
  withSidebarProvider?: boolean
  queryClientOptions?: {
    defaultOptions?: any
  }
  initialSidebarState?: {
    isExpanded?: boolean
    currentPage?: 'NOTIFICATION' | 'SETTINGS' | null
  }
}

// Create a test query client with sensible defaults for testing
const createTestQueryClient = (options?: any) => {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				refetchOnWindowFocus: false,
				staleTime: Infinity,
				cacheTime: Infinity
			},
			mutations: {
				retry: false
			},
			...options
		}
	})
}

// All providers wrapper for comprehensive testing
const AllTheProviders: React.FC<{
  children: React.ReactNode
  queryClient?: QueryClient
  withTooltipProvider?: boolean
  withSidebarProvider?: boolean
}> = ({
	children,
	queryClient,
	withTooltipProvider = true,
	withSidebarProvider = true
}) => {
	const testQueryClient = queryClient || createTestQueryClient()

	let wrappedChildren = (
		<QueryClientProvider client={testQueryClient}>
			{children}
		</QueryClientProvider>
	)

	if (withTooltipProvider) {
		wrappedChildren = (
			<TooltipProvider>
				{wrappedChildren}
			</TooltipProvider>
		)
	}

	if (withSidebarProvider) {
		wrappedChildren = (
			<SidebarProvider>
				{wrappedChildren}
			</SidebarProvider>
		)
	}

	return wrappedChildren
}

// Custom render function
const customRender = (
	ui: React.ReactElement,
	options: CustomRenderOptions = {}
): RenderResult => {
	const {
		withQueryClient = true,
		withTooltipProvider = true,
		withSidebarProvider = true,
		queryClientOptions,
		...renderOptions
	} = options

	const queryClient = withQueryClient
		? createTestQueryClient(queryClientOptions?.defaultOptions)
		: undefined

	const Wrapper: React.FC<{ children: React.ReactNode }> = ({children}) => (
		<AllTheProviders
			queryClient={queryClient}
			withTooltipProvider={withTooltipProvider}
			withSidebarProvider={withSidebarProvider}
		>
			{children}
		</AllTheProviders>
	)

	return render(ui, {wrapper: Wrapper, ...renderOptions})
}

// Render with only specific providers
const renderWithProviders = (
	ui: React.ReactElement,
	options: CustomRenderOptions = {}
): RenderResult => {
	return customRender(ui, options)
}

// Render with minimal setup (no providers)
const renderWithoutProviders = (
	ui: React.ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
	return render(ui, options)
}

// Render with only QueryClient
const renderWithQueryClient = (
	ui: React.ReactElement,
	queryClientOptions?: any
): RenderResult => {
	const queryClient = createTestQueryClient(queryClientOptions)

	const Wrapper: React.FC<{ children: React.ReactNode }> = ({children}) => (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)

	return render(ui, {wrapper: Wrapper})
}

// Export all render utilities
export {
	customRender as render,
	renderWithProviders,
	renderWithoutProviders,
	renderWithQueryClient,
	createTestQueryClient
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export {default as userEvent} from '@testing-library/user-event'

// Re-export all helper utilities
export * from './test-helpers'
export * from './mock-factories'
export * from './api-mocks'
