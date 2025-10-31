import localFont from 'next/font/local'

export const charter = localFont({
	src: [
		{
			path: '../../../../app/fonts/charter/charter_regular.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: '../../../../app/fonts/charter/charter_bold.woff2',
			weight: '700',
			style: 'normal'
		}
	],
	variable: '--font-charter',
	display: 'swap'
})
