import {Path, Rect, Svg, SVGProps} from '@react-pdf/renderer'

const CalendarPDF = (props: SVGProps) => {
	return (
		<Svg
			{...props} width="24" height="24" viewBox="0 0 24 24" fill="none"
			stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
		>
			<Path d="M8 2v4" stroke="currentColor" />
			<Path d="M16 2v4" stroke="currentColor" />
			<Rect width="18" height="18" x="3" y="4" rx="2"/>
			<Path d="M3 10h18"/>
		</Svg>
	)
}

export default CalendarPDF
