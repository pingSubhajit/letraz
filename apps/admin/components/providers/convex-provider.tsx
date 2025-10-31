'use client'

import {ConvexProvider, ConvexReactClient} from 'convex/react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export const ConvexClientProvider = ({
	children
}: {
  children: React.ReactNode;
}) => <ConvexProvider client={convex}>{children}</ConvexProvider>
