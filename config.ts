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
			path: './app/fonts/BwModelicaSS01-Hairline.otf',
			weight: '100',
			style: 'normal'
		},
		{
			path: './app/fonts/BwModelicaSS01-Thin.otf',
			weight: '200',
			style: 'normal'
		},
		{
			path: './app/fonts/BwModelicaSS01-Light.otf',
			weight: '300',
			style: 'normal'
		},
		{
			path: './app/fonts/BwModelicaSS01-Regular.otf',
			weight: '400',
			style: 'normal'
		},
		{
			path: './app/fonts/BwModelicaSS01-Medium.otf',
			weight: '500',
			style: 'normal'
		},
		{
			path: './app/fonts/BwModelicaSS01-Bold.otf',
			weight: '700',
			style: 'normal'
		},
		{
			path: './app/fonts/BwModelicaSS01-ExtraBold.otf',
			weight: '800',
			style: 'normal'
		},
		{
			path: './app/fonts/BwModelicaSS01-Black.otf',
			weight: '900',
			style: 'normal'
		},


		// Italic fonts
		{
			path: './app/fonts/BwModelicaSS01-HairlineItalic.otf',
			weight: '100',
			style: 'italic'
		},
		{
			path: './app/fonts/BwModelicaSS01-ThinItalic.otf',
			weight: '200',
			style: 'italic'
		},
		{
			path: './app/fonts/BwModelicaSS01-LightItalic.otf',
			weight: '300',
			style: 'italic'
		},
		{
			path: './app/fonts/BwModelicaSS01-RegularItalic.otf',
			weight: '400',
			style: 'italic'
		},
		{
			path: './app/fonts/BwModelicaSS01-MediumItalic.otf',
			weight: '500',
			style: 'italic'
		},
		{
			path: './app/fonts/BwModelicaSS01-BoldItalic.otf',
			weight: '700',
			style: 'italic'
		},
		{
			path: './app/fonts/BwModelicaSS01-ExtraBoldItalic.otf',
			weight: '800',
			style: 'italic'
		},
		{
			path: './app/fonts/BwModelicaSS01-BlackItalic.otf',
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
