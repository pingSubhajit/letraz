import localFont from 'next/font/local'
import {Plus_Jakarta_Sans} from 'next/font/google'
import {anthropic} from '@ai-sdk/anthropic'

// Fonts
export const plusJakartaSans = Plus_Jakarta_Sans({
	subsets: ['latin'],
	weight: ['200', '300', '400', '500', '600', '700', '800'],
	style: ['normal', 'italic'],
	display: 'swap',
	variable: '--font-plus-jakarta-sans'
})

export const modelica = localFont({
	src: [
		// Regular fonts
		{
			path: './app/fonts/modelica/BwModelicaSS01-Hairline.woff2',
			weight: '100',
			style: 'normal'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-Thin.woff2',
			weight: '200',
			style: 'normal'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-Light.woff2',
			weight: '300',
			style: 'normal'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-Regular.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-Medium.woff2',
			weight: '500',
			style: 'normal'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-Bold.woff2',
			weight: '700',
			style: 'normal'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-ExtraBold.woff2',
			weight: '800',
			style: 'normal'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-Black.woff2',
			weight: '900',
			style: 'normal'
		},


		// Italic fonts
		{
			path: './app/fonts/modelica/BwModelicaSS01-HairlineItalic.woff2',
			weight: '100',
			style: 'italic'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-ThinItalic.woff2',
			weight: '200',
			style: 'italic'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-LightItalic.woff2',
			weight: '300',
			style: 'italic'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-RegularItalic.woff2',
			weight: '400',
			style: 'italic'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-MediumItalic.woff2',
			weight: '500',
			style: 'italic'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-BoldItalic.woff2',
			weight: '700',
			style: 'italic'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-ExtraBoldItalic.woff2',
			weight: '800',
			style: 'italic'
		},
		{
			path: './app/fonts/modelica/BwModelicaSS01-BlackItalic.woff2',
			weight: '900',
			style: 'italic'
		}
	]
})

// Supporting services
export const defaultUrl = process.env.VERCEL_ENV === 'production'
	? 'https://letraz.app'
	: process.env.MAIN_URL || 'http://localhost:3000'

export const portfolio = 'https://subhajit.lol'
export const ghostBlogUrl = 'https://blog.letraz.app'
export const discordBotUrl = 'http://64.227.146.129:4000'

// Socials
export const discordHandle = 'https://discord.gg/jTkyKCYz2M'
export const githubHandle = 'https://github.com/pingSubhajit/letraz'
export const twitterHandle = 'https://x.com/LetrazApp'
export const linkedinHandle = 'https://www.linkedin.com/company/108621680'
export const instagramHandle = 'https://www.instagram.com/letraz.app/'
export const supportEmail = 'hello@letraz.app'

// Integrations
export const rizeUrl = 'https://rize.so'
export const rizeAdminApiUrl = `${rizeUrl}/api/admin`

// AI
export const model = anthropic('claude-3-haiku-20240307')

// Misc.
export const discordAnnouncementChannelId = '1325855779126902884'

// Password strength configuration
export const passwordStrengthConfig = {
	requirements: {
		minLength: 8,
		requireUppercase: true,
		requireLowercase: true,
		requireNumbers: true,
		requireSpecialChars: true
	},
	strengthLevels: {
		weak: {minScore: 0, color: 'bg-red-500', label: 'Weak'},
		fair: {minScore: 2, color: 'bg-orange-500', label: 'Fair'},
		good: {minScore: 3, color: 'bg-yellow-500', label: 'Good'},
		strong: {minScore: 4, color: 'bg-green-500', label: 'Strong'},
		veryStrong: {minScore: 5, color: 'bg-emerald-500', label: 'Very Strong'}
	}
}
