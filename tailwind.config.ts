import type {Config} from 'tailwindcss'

const config: Config = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}'
	],
	// Safelist dynamic classes used in password strength meter
	safelist: [
		'bg-red-500',
		'bg-orange-500',
		'bg-yellow-500',
		'bg-green-500',
		'bg-emerald-500'
	],
	theme: {
		extend: {
			colors: {
				flame: {
					50: '#FCC6BC',
					100: '#FBB3A5',
					200: '#F88E79',
					300: '#F6684C',
					400: '#F55535',
					500: '#F4421F',
					600: '#DC3B1C',
					700: '#C33519',
					800: '#AB2E16',
					900: '#822513',
					950: '#491409'
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			fontFamily: {
				sans: ['var(--font-geist-sans)'],
				mono: ['var(--font-geist-mono)'],
				jakarta: ['var(--font-plus-jakarta-sans)', 'system-ui', 'sans-serif']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: ({theme}) => ({
				subtle: `0 2px 16px ${theme('colors.neutral.950')}15`
			}),
			keyframes: {
				'collapsible-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-collapsible-content-height)' }
				},
				'collapsible-up': {
					from: { height: 'var(--radix-collapsible-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'collapsible-down': 'collapsible-down 0.2s ease-out',
				'collapsible-up': 'collapsible-up 0.2s ease-out'
			}
		}
	},
	plugins: [
		require('tailwindcss-animate'),
		require('@tailwindcss/typography')
	]
}
export default config
