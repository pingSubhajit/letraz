import localFont from 'next/font/local'
import {anthropic} from '@ai-sdk/anthropic'

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

export const defaultUrl = process.env.VERCEL_ENV === 'production'
	? 'https://letraz.app'
	: process.env.MAIN_URL || 'http://localhost:3000'
export const githubRepo = 'https://github.com/pingSubhajit/letraz'
export const portfolio = 'https://subhajit.lol'

export const model = anthropic('claude-3-haiku-20240307')
