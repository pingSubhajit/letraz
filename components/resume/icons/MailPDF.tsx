import {Path, Rect, Svg, SVGProps} from '@react-pdf/renderer'

const MailPDF = (props: SVGProps) => {
	return (
		<Svg
			{...props} width="24" height="24" viewBox="0 0 24 24" fill="none"
			stroke="white"
	     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
			<Rect width="20" height="16" x="2" y="4" rx="2"/>
			<Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
		</Svg>
	)
}

export default MailPDF
