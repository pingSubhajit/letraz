import type {NextConfig} from 'next'
import {validateEnv} from '@/env'

validateEnv()

const nextConfig: NextConfig = {
	/* config options here */
}

export default nextConfig
